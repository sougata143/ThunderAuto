import { AdminService } from '../../services/admin.service'
import { IContext } from '../../types/context'
import { FileUpload } from '../../types/file'
import { ICar } from '../../models/Car'
import Car from '../../models/Car'

interface AdminCarInput {
  make: string
  model: string
  year: number
  price: number
  engineType: string
  transmission: string
  power: number
  acceleration: number
  status: 'draft' | 'published' | 'archived'
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
  }
}

export const adminResolvers = {
  Query: {
    adminCars: async (_: unknown, __: unknown, { user }: IContext) => {
      // Add admin authorization check here
      if (!user) {
        throw new Error('Not authenticated')
      }

      try {
        const cars = await Car.find({})
          .populate('createdBy', 'name email')
          .populate('lastUpdatedBy', 'name email')
          .sort({ createdAt: -1 })
        return cars
      } catch (error) {
        console.error('Error fetching cars:', error)
        throw error
      }
    }
  },

  Mutation: {
    createCar: async (_: unknown, { input }: { input: AdminCarInput }, { user }: IContext) => {
      // Add admin authorization check here
      if (!user) {
        throw new Error('Not authenticated')
      }

      try {
        const car = new Car({
          ...input,
          createdBy: user._id,
          lastUpdatedBy: user._id
        })

        await car.save()
        return car
      } catch (error) {
        console.error('Error creating car:', error)
        throw error
      }
    },

    updateCar: async (_: unknown, { id, input }: { id: string, input: Partial<AdminCarInput> }, { user }: IContext) => {
      // Add admin authorization check here
      if (!user) {
        throw new Error('Not authenticated')
      }

      try {
        const car = await Car.findByIdAndUpdate(
          id,
          {
            ...input,
            lastUpdatedBy: user._id
          },
          { new: true }
        )
          .populate('createdBy', 'name email')
          .populate('lastUpdatedBy', 'name email')

        if (!car) {
          throw new Error('Car not found')
        }

        return car
      } catch (error) {
        console.error('Error updating car:', error)
        throw error
      }
    },

    deleteCar: async (_: unknown, { id }: { id: string }, { user }: IContext) => {
      // Add admin authorization check here
      if (!user) {
        throw new Error('Not authenticated')
      }

      try {
        const car = await Car.findByIdAndDelete(id)

        if (!car) {
          throw new Error('Car not found')
        }

        return car
      } catch (error) {
        console.error('Error deleting car:', error)
        throw error
      }
    },

    updateCarStatus: async (_: unknown, { id, status }: { id: string, status: 'draft' | 'published' | 'archived' }, { user }: IContext) => {
      // Add admin authorization check here
      if (!user) {
        throw new Error('Not authenticated')
      }

      try {
        const car = await Car.findByIdAndUpdate(
          id,
          {
            status,
            lastUpdatedBy: user._id
          },
          { new: true }
        )
          .populate('createdBy', 'name email')
          .populate('lastUpdatedBy', 'name email')

        if (!car) {
          throw new Error('Car not found')
        }

        return car
      } catch (error) {
        console.error('Error updating car status:', error)
        throw error
      }
    }
  },

  AdminMutation: {
    createCar: async (_, { input }, { user }: IContext) => {
      return AdminService.createCar(input, user)
    },

    updateCar: async (_, { id, input }, { user }: IContext) => {
      return AdminService.updateCar(id, input, user)
    },

    uploadCarImage: async (
      _,
      { carId, image, caption, isFeatured },
      { user }: IContext
    ) => {
      return AdminService.uploadCarImage(
        carId,
        image as FileUpload,
        caption,
        isFeatured,
        user
      )
    },

    deleteCarImage: async (_, { carId, imageUrl }, { user }: IContext) => {
      return AdminService.deleteCarImage(carId, imageUrl, user)
    },

    updateCarStatus: async (_, { carId, status }, { user }: IContext) => {
      return AdminService.updateCarStatus(carId, status.toLowerCase(), user)
    },

    deleteCar: async (_, { id }, { user }: IContext) => {
      return AdminService.deleteCar(id, user)
    }
  }
}
