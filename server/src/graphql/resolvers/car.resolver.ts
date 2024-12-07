import { ICar } from '../../models/Car'
import Car from '../../models/Car'
import { IContext } from '../../types/context'

interface CarFilters {
  make?: string
  model?: string
  year?: number
  engineType?: string
  transmission?: string
  minPrice?: number
  maxPrice?: number
}

interface CarInput {
  make: string
  model: string
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
  }
}

export const carResolvers = {
  Query: {
    cars: async (_: unknown, filters: CarFilters, { user }: IContext) => {
      try {
        const query: Record<string, any> = {}

        if (filters.make) query.make = filters.make
        if (filters.model) query.model = filters.model
        if (filters.year) query.year = filters.year
        if (filters.engineType) query.engineType = filters.engineType
        if (filters.transmission) query.transmission = filters.transmission

        if (filters.minPrice || filters.maxPrice) {
          query.price = {}
          if (filters.minPrice) query.price.$gte = filters.minPrice
          if (filters.maxPrice) query.price.$lte = filters.maxPrice
        }

        const cars = await Car.find(query)
          .populate('createdBy', 'name email')
          .populate('lastUpdatedBy', 'name email')
          .sort({ createdAt: -1 })
        return cars
      } catch (error) {
        console.error('Error fetching cars:', error)
        throw error
      }
    },

    car: async (_: unknown, { id }: { id: string }, _context: IContext) => {
      try {
        const car = await Car.findById(id)
          .populate('createdBy', 'name email')
          .populate('lastUpdatedBy', 'name email')
        
        if (!car) {
          throw new Error('Car not found')
        }

        return car
      } catch (error) {
        console.error('Error fetching car:', error)
        throw error
      }
    },

    carsByMake: async (_: unknown, { make }: { make: string }, _context: IContext) => {
      try {
        const cars = await Car.find({ make })
          .populate('createdBy', 'name email')
          .populate('lastUpdatedBy', 'name email')
          .sort({ year: -1 })
        return cars
      } catch (error) {
        console.error('Error fetching cars by make:', error)
        throw error
      }
    },

    carsByYear: async (_: unknown, { year }: { year: number }, _context: IContext) => {
      try {
        const cars = await Car.find({ year })
          .populate('createdBy', 'name email')
          .populate('lastUpdatedBy', 'name email')
          .sort({ make: 1, model: 1 })
        return cars
      } catch (error) {
        console.error('Error fetching cars by year:', error)
        throw error
      }
    },

    searchCars: async (_: unknown, { query }: { query: string }, _context: IContext) => {
      try {
        const searchRegex = new RegExp(query, 'i')
        const cars = await Car.find({
          $or: [
            { make: searchRegex },
            { model: searchRegex },
            { engineType: searchRegex },
            { transmission: searchRegex }
          ]
        })
          .populate('createdBy', 'name email')
          .populate('lastUpdatedBy', 'name email')
          .sort({ createdAt: -1 })
        return cars
      } catch (error) {
        console.error('Error searching cars:', error)
        throw error
      }
    }
  },

  Car: {
    // Resolver for computing any derived fields
    fullName: (parent: ICar) => `${parent.year} ${parent.make} ${parent.model}`,
    
    // Resolver for handling the images array
    images: (parent: ICar) => {
      return parent.images.map(image => ({
        ...image,
        uploadedBy: parent.populated('images.uploadedBy') 
          ? image.uploadedBy 
          : { _id: image.uploadedBy }
      }))
    },

    // Resolver for handling reviews
    reviews: async (parent: ICar) => {
      if (!parent.populated('reviews.user.id')) {
        await parent.populate('reviews.user.id', 'name email')
      }
      return parent.reviews
    }
  }
}
