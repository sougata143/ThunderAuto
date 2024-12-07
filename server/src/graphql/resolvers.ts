import { AuthService } from '../services/auth.service'
import { ICar, Car } from '../models/Car'
import mongoose from 'mongoose'
import { IUser, User } from '../models/User'
import { createRedisClient } from '../config/redis'
import { logger } from '../utils/logger'
import { nanoid } from 'nanoid'
import { userResolvers } from './resolvers/user.resolver'

// Get the Car model
// const Car = mongoose.model<ICar>('Car')

interface CarFilter {
  make?: string
  model?: string
  year?: number
  engineType?: string
  transmission?: string
  fuelType?: string
  minPrice?: number
  maxPrice?: number
}

interface ReviewInput {
  carId: string
  rating: number
  comment: string
}

interface IContext {
  user: IUser | null
}

interface IReview {
  user: {
    id: string
    name: string
  }
  rating: number
  comment: string
  createdAt: Date
}

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    me: (_: unknown, __: unknown, { user }: IContext) => {
      return user
    },
    cars: async (_: unknown, { filter = {}, limit = 20, offset = 0 }: { filter: CarFilter, limit: number, offset: number }) => {
      try {
        const query: Record<string, any> = {}
        
        if (filter.make) query.make = new RegExp(filter.make, 'i')
        if (filter.model) query.model = new RegExp(filter.model, 'i')
        if (filter.year) query.year = filter.year
        if (filter.engineType) query.engineType = filter.engineType
        if (filter.transmission) query.transmission = filter.transmission
        if (filter.fuelType) query.fuelType = filter.fuelType
        
        if (filter.minPrice || filter.maxPrice) {
          query.price = {}
          if (filter.minPrice) query.price.$gte = filter.minPrice
          if (filter.maxPrice) query.price.$lte = filter.maxPrice
        }

        return await Car.find(query)
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
      } catch (error) {
        logger.error('Error fetching cars:', error)
        throw error
      }
    },

    car: async (_: unknown, { id }: { id: string }) => {
      try {
        const redis = await createRedisClient()
        const cacheKey = `car:${id}`
        
        // Try to get from cache
        const cachedCar = await redis.get(cacheKey)
        if (cachedCar) {
          return JSON.parse(cachedCar)
        }
        
        // Get from database
        const car = await Car.findById(id)
        if (!car) {
          throw new Error('Car not found')
        }

        // Cache the result
        await redis.set(cacheKey, JSON.stringify(car), 'EX', 3600)
        return car
      } catch (error) {
        logger.error('Error fetching car:', error)
        throw error
      }
    },

    compareCars: async (_: unknown, { ids }: { ids: string[] }) => {
      try {
        const cars = await Car.find({ _id: { $in: ids } })
        if (cars.length !== ids.length) {
          throw new Error('One or more cars not found')
        }
        return cars
      } catch (error) {
        logger.error('Error comparing cars:', error)
        throw error
      }
    },

    searchCars: async (_: unknown, { query }: { query: string }) => {
      try {
        const searchRegex = new RegExp(query, 'i')
        return await Car.find({
          $or: [
            { make: searchRegex },
            { model: searchRegex },
            { engineType: searchRegex },
            { transmission: searchRegex }
          ]
        })
      } catch (error) {
        logger.error('Error searching cars:', error)
        throw error
      }
    },

    reviews: async (_: unknown, { carId }: { carId: string }) => {
      try {
        const car = await Car.findById(carId).populate('reviews.user')
        return car?.reviews || []
      } catch (error) {
        logger.error('Error fetching reviews:', error)
        throw error
      }
    }
  },

  Mutation: {
    ...userResolvers.Mutation,
    registerUser: async (_: unknown, { input }: { input: { email: string, password: string, name: string } }) => {
      try {
        const user = await User.create({
          email: input.email,
          password: input.password,
          name: input.name,
          role: 'user',
          isGuest: false
        })
        return {
          token: AuthService.generateToken(user),
          user
        }
      } catch (error) {
        logger.error('Error registering user:', error)
        throw error
      }
    },

    loginUser: async (_: unknown, { input }: { input: { email: string, password: string } }) => {
      try {
        const user = await User.findOne({ email: input.email })
        if (!user) {
          throw new Error('User not found')
        }

        const isValid = await user.comparePassword(input.password)
        if (!isValid) {
          throw new Error('Invalid password')
        }

        return {
          token: AuthService.generateToken(user),
          user
        }
      } catch (error) {
        logger.error('Error logging in:', error)
        throw error
      }
    },

    createGuestUser: async () => {
      try {
        const user = await User.create({
          name: `Guest_${nanoid(6)}`,
          email: `guest_${nanoid(8)}@temp.com`,
          role: 'guest',
          isGuest: true
        })
        return {
          token: AuthService.generateToken(user),
          user
        }
      } catch (error) {
        logger.error('Error creating guest user:', error)
        throw error
      }
    },

    upgradeGuestUser: async (_: unknown, { input }: { input: { email: string, password: string, name: string } }, { user }: IContext) => {
      if (!user || !user.isGuest) {
        throw new Error('Only guest users can be upgraded')
      }

      try {
        user.email = input.email
        user.password = input.password
        user.name = input.name
        user.isGuest = false
        user.role = 'user'

        await user.save()

        return {
          token: AuthService.generateToken(user),
          user
        }
      } catch (error) {
        logger.error('Error upgrading guest user:', error)
        throw error
      }
    },

    updateUser: async (_: unknown, { input }: { input: Partial<IUser> }, { user }: IContext) => {
      if (!user) {
        throw new Error('Not authenticated')
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { $set: input },
          { new: true }
        )

        if (!updatedUser) {
          throw new Error('User not found')
        }

        return updatedUser
      } catch (error) {
        logger.error('Error updating user:', error)
        throw error
      }
    },

    createReview: async (_: unknown, { input }: { input: ReviewInput }, { user }: IContext) => {
      if (!user) {
        throw new Error('Not authenticated')
      }

      try {
        const car = await Car.findById(input.carId)
        if (!car) {
          throw new Error('Car not found')
        }

        const userId = (user as IUser & { _id: mongoose.Types.ObjectId })._id

        const review: IReview = {
          user: {
            id: userId.toString(),
            name: user.name
          },
          rating: input.rating,
          comment: input.comment,
          createdAt: new Date()
        }

        if (!car.reviews) {
          car.reviews = []
        }
        car.reviews.push(review)
        await car.save()

        return review
      } catch (error) {
        logger.error('Error creating review:', error)
        throw error
      }
    },

    updateReview: async (_: unknown, { id, rating, comment }: { id: string, rating: number, comment: string }, { user }: IContext) => {
      if (!user) {
        throw new Error('Not authenticated')
      }

      try {
        const car = await Car.findOne({ 'reviews._id': id })
        if (!car) {
          throw new Error('Review not found')
        }

        const userId = (user as IUser & { _id: mongoose.Types.ObjectId })._id

        const review = car.reviews.find(r => r.user.id === id)
        if (!review || review.user.id !== userId.toString()) {
          throw new Error('Not authorized to update this review')
        }

        review.rating = rating
        review.comment = comment
        await car.save()

        return review
      } catch (error) {
        logger.error('Error updating review:', error)
        throw error
      }
    },

    deleteReview: async (_: unknown, { id }: { id: string }, { user }: IContext) => {
      if (!user) {
        throw new Error('Not authenticated')
      }

      try {
        const car = await Car.findOne({ 'reviews._id': id })
        if (!car) {
          throw new Error('Review not found')
        }

        const userId = (user as IUser & { _id: mongoose.Types.ObjectId })._id

        const reviewIndex = car.reviews.findIndex(r => r.user.id === id)
        if (reviewIndex === -1 || car.reviews[reviewIndex].user.id !== userId.toString()) {
          throw new Error('Not authorized to delete this review')
        }

        const review = car.reviews[reviewIndex]
        car.reviews.splice(reviewIndex, 1)
        await car.save()

        return review
      } catch (error) {
        logger.error('Error deleting review:', error)
        throw error
      }
    }
  },

  Car: {
    reviews: async (parent: ICar) => {
      return parent.reviews || []
    }
  },

  Review: {
    user: async (parent: IReview) => {
      return parent.user
    }
  }
}
