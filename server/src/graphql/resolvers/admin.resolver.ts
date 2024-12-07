import { AdminService } from '../../services/admin.service'
import { IContext } from '../../types/context'
import { FileUpload } from '../../types/file'
import { ICar } from '../../models/Car'
import { Car } from '../../models/Car'
import { IUser } from '../../models/User'

interface AdminCarInput {
  make: string
  carModel: string
  year: number
  price: number
  engineType: string
  transmission: string
  power: number
  acceleration: number
  specs: {
    engine: {
      displacement: number
      cylinders: number
      configuration: string
      fuelInjection: string
      turbocharger: boolean
      supercharger: boolean
      compression: string
      valvesPerCylinder: number
    }
    performance: {
      powerToWeight: number
      topSpeed: number
      acceleration060: number
      acceleration0100: number
      quarterMile: number
      brakingDistance60_0: number
    }
    chassis: {
      bodyType: string
      platform: string
      frontSuspension: string
      rearSuspension: string
      frontBrakes: string
      rearBrakes: string
      wheelSize: string
      tireSize: string
    }
    dimensions: {
      length: number
      width: number
      height: number
      wheelbase: number
      groundClearance: number
      dragCoefficient: number
      weight: number
      distribution: string
    }
    transmission: {
      type: string
      gears: number
      clutchType: string
      driveType: string
      differential: string
    }
    fuel: {
      fuelType: string
      fuelSystem: string
      tankCapacity: number
      cityMPG: number
      highwayMPG: number
      combinedMPG: number
      emissionClass: string
    }
    interior: {
      seatingCapacity: number
      doors: number
      trunkCapacity: number
      infotainmentScreen: string
      soundSystem: string
      climateZones: number
      upholsteryMaterial: string
    }
    safety: {
      airbags: string
      abs: boolean
      stabilityControl: boolean
      tractionControl: boolean
      parkingSensors: boolean
      camera: string
      blindSpotMonitoring: boolean
      laneDepartureWarning: boolean
      collisionWarning: boolean
      nightVision: boolean
    }
    technology: {
      connectivity: string[]
      smartphone: string[]
      navigation: string
      headlightType: string
      adaptiveCruiseControl: boolean
      keylessEntry: boolean
      startSystem: string
      driverAssistance: string[]
    }
    warranty: {
      basic: string
      powertrain: string
      corrosion: string
      roadside: string
      maintenance: string
    }
    features: {
      safety: string[]
      comfort: string[]
      technology: string[]
      exterior: string[]
      interior: string[]
    }
  }
}

export const adminResolvers = {
  Query: {
    admin: () => ({})
  },

  AdminQuery: {
    adminCars: async (_parent: unknown, _args: unknown, context: IContext): Promise<ICar[]> => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
      }
      return Car.find()
    }
  },

  Mutation: {
    admin: () => ({})
  },

  AdminMutation: {
    createCar: async (_parent: unknown, { input }: { input: AdminCarInput }, context: IContext): Promise<ICar> => {
      try {
        if (!context.user || context.user.role !== 'ADMIN') {
          throw new Error('Unauthorized: Admin access required')
        }

        console.log('Creating car with input:', JSON.stringify(input, null, 2))

        const carData = {
          make: input.make,
          carModel: input.carModel,
          year: input.year,
          price: input.price,
          engineType: input.engineType,
          transmission: input.transmission,
          power: input.power,
          acceleration: input.acceleration,
          specs: {
            ...input.specs,
            features: {
              safety: input.specs.features.safety,
              comfort: input.specs.features.comfort,
              technology: input.specs.features.technology,
              exterior: input.specs.features.exterior,
              interior: input.specs.features.interior
            }
          },
          status: 'draft',
          createdBy: context.user._id,
          lastUpdatedBy: context.user._id,
          rating: 0,
          images: []
        }

        console.log('Creating car with data:', JSON.stringify(carData, null, 2))

        const car = await Car.create(carData)

        console.log('Created car:', JSON.stringify(car, null, 2))

        if (!car) {
          throw new Error('Failed to create car')
        }

        return car
      } catch (error) {
        console.error('Error creating car:', error)
        throw error
      }
    },

    updateCar: async (_parent: unknown, { id, input }: { id: string, input: Partial<AdminCarInput> }, context: IContext): Promise<ICar> => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
      }
      const car = await Car.findByIdAndUpdate(
        id,
        {
          ...input,
          lastUpdatedBy: context.user._id
        },
        { new: true }
      )
      if (!car) {
        throw new Error('Car not found')
      }
      return car
    },

    uploadCarImage: async (
      _parent: unknown,
      { carId, image, caption, isFeatured }: { carId: string, image: FileUpload, caption?: string, isFeatured: boolean },
      context: IContext
    ): Promise<ICar> => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
      }
      // TODO: Implement image upload logic
      const car = await Car.findByIdAndUpdate(
        carId,
        {
          $push: {
            images: {
              url: 'placeholder-url',
              isFeatured,
              caption,
              uploadedBy: context.user._id,
              uploadedAt: new Date()
            }
          },
          lastUpdatedBy: context.user._id
        },
        { new: true }
      )
      if (!car) {
        throw new Error('Car not found')
      }
      return car
    },

    deleteCarImage: async (_parent: unknown, { carId, imageUrl }: { carId: string, imageUrl: string }, context: IContext): Promise<ICar> => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
      }
      const car = await Car.findByIdAndUpdate(
        carId,
        {
          $pull: { images: { url: imageUrl } },
          lastUpdatedBy: context.user._id
        },
        { new: true }
      )
      if (!car) {
        throw new Error('Car not found')
      }
      return car
    },

    updateCarStatus: async (_parent: unknown, { carId, status }: { carId: string, status: 'draft' | 'published' | 'archived' }, context: IContext): Promise<ICar> => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
      }
      const car = await Car.findByIdAndUpdate(
        carId,
        {
          status,
          lastUpdatedBy: context.user._id
        },
        { new: true }
      )
      if (!car) {
        throw new Error('Car not found')
      }
      return car
    },

    deleteCar: async (_parent: unknown, { id }: { id: string }, context: IContext): Promise<{ success: boolean, message: string }> => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
      }
      const car = await Car.findByIdAndDelete(id)
      if (!car) {
        throw new Error('Car not found')
      }
      return { success: true, message: 'Car deleted successfully' }
    }
  }
}
