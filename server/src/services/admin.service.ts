import { ICar } from '../models/Car'
import Car from '../models/Car'
import { IUser } from '../models/User'
import { UserInputError, AuthenticationError } from 'apollo-server-express'
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary'
import { Stream } from 'stream'

export class AdminService {
  static async createCar(carData: Partial<ICar>, adminUser: IUser) {
    if (!adminUser || adminUser.role !== 'admin') {
      throw new AuthenticationError('Only admin users can create cars')
    }

    const car = new Car({
      ...carData,
      createdBy: adminUser._id,
      lastUpdatedBy: adminUser._id,
      status: 'draft'
    })

    await car.save()
    return car
  }

  static async updateCar(carId: string, carData: Partial<ICar>, adminUser: IUser) {
    if (!adminUser || adminUser.role !== 'admin') {
      throw new AuthenticationError('Only admin users can update cars')
    }

    const car = await Car.findById(carId)
    if (!car) {
      throw new UserInputError('Car not found')
    }

    Object.assign(car, {
      ...carData,
      lastUpdatedBy: adminUser._id
    })

    await car.save()
    return car
  }

  static async uploadCarImage(
    carId: string,
    image: {
      createReadStream: () => Stream
      filename: string
      mimetype: string
    },
    caption: string,
    isFeatured: boolean,
    adminUser: IUser
  ) {
    if (!adminUser || adminUser.role !== 'admin') {
      throw new AuthenticationError('Only admin users can upload car images')
    }

    const car = await Car.findById(carId)
    if (!car) {
      throw new UserInputError('Car not found')
    }

    // Upload image to Cloudinary
    const stream = image.createReadStream()
    const result = await uploadToCloudinary(stream, {
      folder: `cars/${carId}`,
      public_id: `${Date.now()}-${image.filename}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 1200, height: 800, crop: 'fill' },
        { quality: 'auto:good' }
      ]
    })

    // Add image to car
    car.images.push({
      url: result.secure_url,
      caption,
      isFeatured,
      uploadedBy: adminUser._id,
      uploadedAt: new Date()
    })

    // If this is a featured image, unfeatured others
    if (isFeatured) {
      car.images = car.images.map(img => ({
        ...img,
        isFeatured: img.url === result.secure_url
      }))
    }

    await car.save()
    return car
  }

  static async deleteCarImage(carId: string, imageUrl: string, adminUser: IUser) {
    if (!adminUser || adminUser.role !== 'admin') {
      throw new AuthenticationError('Only admin users can delete car images')
    }

    const car = await Car.findById(carId)
    if (!car) {
      throw new UserInputError('Car not found')
    }

    // Find image in car
    const imageIndex = car.images.findIndex(img => img.url === imageUrl)
    if (imageIndex === -1) {
      throw new UserInputError('Image not found')
    }

    // Delete from Cloudinary
    const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0]
    await deleteFromCloudinary(publicId)

    // Remove from car
    car.images.splice(imageIndex, 1)
    await car.save()
    return car
  }

  static async updateCarStatus(carId: string, status: 'draft' | 'published' | 'archived', adminUser: IUser) {
    if (!adminUser || adminUser.role !== 'admin') {
      throw new AuthenticationError('Only admin users can update car status')
    }

    const car = await Car.findById(carId)
    if (!car) {
      throw new UserInputError('Car not found')
    }

    car.status = status
    car.lastUpdatedBy = adminUser._id
    await car.save()
    return car
  }

  static async deleteCar(carId: string, adminUser: IUser) {
    if (!adminUser || adminUser.role !== 'admin') {
      throw new AuthenticationError('Only admin users can delete cars')
    }

    const car = await Car.findById(carId)
    if (!car) {
      throw new UserInputError('Car not found')
    }

    // Delete all images from Cloudinary
    await Promise.all(
      car.images.map(async (image) => {
        const publicId = image.url.split('/').slice(-1)[0].split('.')[0]
        await deleteFromCloudinary(publicId)
      })
    )

    await car.deleteOne()
    return { success: true, message: 'Car deleted successfully' }
  }
}
