import mongoose, { Document } from 'mongoose'
import { ICar } from '../../models/Car'
import { Car } from '../../models/Car'
import { IContext } from '../../types/context'
import { IUser } from '../../models/User'

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

interface PopulatedUserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  role: 'GUEST' | 'USER' | 'ADMIN';
}

// Type guard to check if a value is a populated User document
function isPopulatedUser(value: any): value is PopulatedUserDocument {
  return value && 
         value instanceof Document && 
         typeof (value as any).firstName === 'string' &&
         typeof (value as any).lastName === 'string' &&
         typeof (value as any).email === 'string' &&
         typeof (value as any).role === 'string' &&
         value._id instanceof mongoose.Types.ObjectId;
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
          .populate('createdBy', 'firstName lastName email')
          .populate('lastUpdatedBy', 'firstName lastName email')
          .sort({ createdAt: -1 })
        return cars
      } catch (error) {
        console.error('Error fetching cars:', error)
        throw error
      }
    },

    car: async (_: unknown, { id }: { id: string }, _context: IContext) => {
      try {
        console.log('Fetching car with ID:', id);
        
        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
          console.error('Invalid car ID format:', id);
          throw new Error('Invalid car ID format');
        }

        const car = await Car.findById(id)
          .populate('createdBy', 'firstName lastName email')
          .populate('lastUpdatedBy', 'firstName lastName email');
        
        console.log('Found car:', JSON.stringify(car, null, 2));
        
        if (!car) {
          console.error('Car not found with ID:', id);
          throw new Error('Car not found');
        }

        // Ensure required fields are present
        if (!car.make || !car.carModel || !car.year) {
          console.error('Car data is incomplete:', car);
          throw new Error('Car data is incomplete');
        }

        return car;
      } catch (error) {
        console.error('Error fetching car:', error);
        throw error;
      }
    },

    carsByMake: async (_: unknown, { make }: { make: string }, _context: IContext) => {
      try {
        const cars = await Car.find({ make })
          .populate('createdBy', 'firstName lastName email')
          .populate('lastUpdatedBy', 'firstName lastName email')
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
          .populate('createdBy', 'firstName lastName email')
          .populate('lastUpdatedBy', 'firstName lastName email')
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
          .populate('createdBy', 'firstName lastName email')
          .populate('lastUpdatedBy', 'firstName lastName email')
          .sort({ createdAt: -1 })
        return cars
      } catch (error) {
        console.error('Error searching cars:', error)
        throw error
      }
    }
  },

  Mutation: {
    createCar: async (_: unknown, { input }: { input: CarInput }, { user }: IContext) => {
      if (!user || user.role !== 'ADMIN') {
        throw new Error('Unauthorized. Only admins can create cars.')
      }

      try {
        const newCar = new Car({
          ...input,
          createdBy: user._id,
          lastUpdatedBy: user._id,
          status: 'DRAFT'
        })
        await newCar.save()
        return newCar
      } catch (error) {
        console.error('Error creating car:', error)
        throw new Error('Failed to create car')
      }
    },

    updateCar: async (_: unknown, { id, input }: { id: string; input: any }, context: IContext) => {
      try {
        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error('Invalid car ID format');
        }

        // Check if car exists
        const existingCar = await Car.findById(id);
        if (!existingCar) {
          throw new Error('Car not found');
        }

        // Update the car with the new input
        const updatedCar = await Car.findByIdAndUpdate(
          id,
          {
            ...input,
            lastUpdatedBy: context.user?.id,
            updatedAt: new Date(),
          },
          { new: true, runValidators: true }
        )
          .populate('createdBy', 'firstName lastName email')
          .populate('lastUpdatedBy', 'firstName lastName email');

        if (!updatedCar) {
          throw new Error('Failed to update car');
        }

        return updatedCar;
      } catch (error) {
        console.error('Error updating car:', error);
        throw error;
      }
    },

    deleteCar: async (_: unknown, { id }: { id: string }, { user }: IContext) => {
      if (!user || user.role !== 'ADMIN') {
        throw new Error('Unauthorized. Only admins can delete cars.')
      }

      try {
        const car = await Car.findByIdAndDelete(id)
        if (!car) {
          throw new Error('Car not found')
        }
        return car
      } catch (error) {
        console.error('Error deleting car:', error)
        throw new Error('Failed to delete car')
      }
    }
  },

  Car: {
    // Resolver for computing any derived fields
    fullName: (parent: ICar) => {
      if (!parent.make || !parent.carModel || !parent.year) {
        throw new Error('Required fields for fullName are missing');
      }
      return `${parent.year} ${parent.make} ${parent.carModel}`;
    },
    
    // Resolver for handling the images array
    images: (parent: ICar) => {
      // Check if images exist before mapping
      if (!parent.images || parent.images.length === 0) {
        return [];
      }
      return parent.images.map(image => ({
        ...image,
        uploadedBy: parent.populated('images.uploadedBy') 
          ? image.uploadedBy 
          : { _id: image.uploadedBy }
      }));
    },

    // Resolver for handling reviews
    reviews: async (parent: ICar) => {
      if (!parent.populated('reviews.user')) {
        await parent.populate('reviews.user');
      }
      return parent.reviews;
    },

    // Resolver for createdBy
    createdBy: async (parent: ICar) => {
      if (!parent.populated('createdBy')) {
        await parent.populate<{ createdBy: PopulatedUserDocument }>('createdBy');
      }
      
      const userDoc = parent.createdBy;
      if (!isPopulatedUser(userDoc)) {
        throw new Error('User data not properly populated');
      }

      const user = userDoc.toObject();
      return {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      };
    },

    // Resolver for lastUpdatedBy
    lastUpdatedBy: async (parent: ICar) => {
      if (!parent.populated('lastUpdatedBy')) {
        await parent.populate<{ lastUpdatedBy: PopulatedUserDocument }>('lastUpdatedBy');
      }
      
      const userDoc = parent.lastUpdatedBy;
      if (!isPopulatedUser(userDoc)) {
        throw new Error('User data not properly populated');
      }

      const user = userDoc.toObject();
      return {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      };
    }
  }
}
