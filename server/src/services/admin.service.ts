import { ICar, Car } from '../models/Car'
import { IUser, User } from '../models/User'
import { GraphQLError } from 'graphql'
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary'
import { Stream } from 'stream'
import mongoose from 'mongoose'

export class AdminService {
  static async createCar(carData: Partial<ICar>, adminUser: IUser) {
    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new GraphQLError('Only admin users can create cars', {
        extensions: { code: 'FORBIDDEN' }
      })
    }

    const car = new Car({
      ...carData,
      createdBy: adminUser._id as mongoose.Types.ObjectId,
      lastUpdatedBy: adminUser._id as mongoose.Types.ObjectId,
      status: 'draft'
    })

    await car.save()
    return car
  }

  static async updateCar(carId: string, carData: Partial<ICar>, adminUser: IUser) {
    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new GraphQLError('Only admin users can update cars', {
        extensions: { code: 'FORBIDDEN' }
      })
    }

    const car = await Car.findById(carId)
    if (!car) {
      throw new GraphQLError('Car not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }

    Object.assign(car, {
      ...carData,
      lastUpdatedBy: adminUser._id as mongoose.Types.ObjectId
    })

    await car.save()
    return car
  }

  static async uploadCarImage(
    carId: string,
    file: {
      createReadStream: () => Stream
      filename: string
      mimetype: string
    },
    caption: string,
    isFeatured: boolean,
    adminUser: IUser
  ) {
    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new GraphQLError('Only admin users can upload car images', {
        extensions: { code: 'FORBIDDEN' }
      })
    }

    const car = await Car.findById(carId)
    if (!car) {
      throw new GraphQLError('Car not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }

    // Upload image to Cloudinary
    const stream = file.createReadStream()
    const result = await uploadToCloudinary(stream, {
      folder: `cars/${carId}`,
      public_id: `${Date.now()}-${file.filename}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 1200, height: 800, crop: 'fill' },
        { quality: 'auto:good' }
      ]
    })

    // Add image to car
    if (!car.images) {
      car.images = []
    }
    car.images.push({
      url: result.secure_url,
      caption,
      isFeatured,
      uploadedBy: adminUser._id as mongoose.Types.ObjectId,
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
    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new GraphQLError('Only admin users can delete car images', {
        extensions: { code: 'FORBIDDEN' }
      })
    }

    const car = await Car.findById(carId)
    if (!car) {
      throw new GraphQLError('Car not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }

    // Find image in car
    const imageIndex = car.images?.findIndex(img => img.url === imageUrl) ?? -1
    if (imageIndex === -1) {
      throw new GraphQLError('Image not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }

    // Delete from Cloudinary
    const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0]
    await deleteFromCloudinary(publicId)

    // Remove from car
    car.images?.splice(imageIndex, 1)
    await car.save()
    return car
  }

  static async updateCarStatus(carId: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED', adminUser: IUser) {
    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new GraphQLError('Only admin users can update car status', {
        extensions: { code: 'FORBIDDEN' }
      })
    }

    const car = await Car.findById(carId)
    if (!car) {
      throw new GraphQLError('Car not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }

    car.status = status
    car.lastUpdatedBy = adminUser._id as mongoose.Types.ObjectId
    await car.save()
    return car
  }

  static async deleteCar(carId: string, adminUser: IUser) {
    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new GraphQLError('Only admin users can delete cars', {
        extensions: { code: 'FORBIDDEN' }
      })
    }

    const car = await Car.findById(carId)
    if (!car) {
      throw new GraphQLError('Car not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }

    // Delete all images from Cloudinary
    await Promise.all(
      car.images?.map(async (image) => {
        const publicId = image.url.split('/').slice(-1)[0].split('.')[0]
        await deleteFromCloudinary(publicId)
      }) ?? []
    )

    await car.deleteOne()
    return { success: true, message: 'Car deleted successfully' }
  }
}
