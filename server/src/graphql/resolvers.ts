import { AuthService } from '../services/auth.service'
import { ICar, Car } from '../models/Car'
import mongoose from 'mongoose'
import { IUser, User } from '../models/User'
import { createRedisClient } from '../config/redis'
import { logger } from '../utils/logger'
import { nanoid } from 'nanoid'
import { userResolvers } from './resolvers/user.resolver'
import { adminResolvers } from './resolvers/admin.resolver'
import { carResolvers } from './resolvers/car.resolver'
import bcryptjs from 'bcryptjs'

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
    firstName: string
    lastName: string
  }
  rating: number
  comment: string
  createdAt: Date
}

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...adminResolvers.Query,
    ...carResolvers.Query,
    me: (_: unknown, __: unknown, { user }: IContext) => {
      return user
    },
    cars: async (_: unknown, { filter = {}, limit = 20, offset = 0 }: { filter: CarFilter, limit: number, offset: number }) => {
      try {
        const query: any = {}

        if (filter.make) query.make = filter.make
        if (filter.model) query.model = filter.model
        if (filter.year) query.year = filter.year
        if (filter.engineType) query.engineType = filter.engineType
        if (filter.transmission) query.transmission = filter.transmission
        if (filter.fuelType) query.specs = { ...query.specs, fuel: { fuelType: filter.fuelType } }

        if (filter.minPrice || filter.maxPrice) {
          query.price = {}
          if (filter.minPrice) query.price.$gte = filter.minPrice
          if (filter.maxPrice) query.price.$lte = filter.maxPrice
        }

        const cars = await Car.find(query)
          .skip(offset)
          .limit(limit)
          .sort({ createdAt: -1 })

        return cars
      } catch (error) {
        logger.error('Error fetching cars:', error)
        throw error
      }
    },

    car: async (_: unknown, { id }: { id: string }) => {
      try {
        const car = await Car.findById(id)
        if (!car) {
          throw new Error('Car not found')
        }
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
        const cars = await Car.find({
          $or: [
            { make: searchRegex },
            { carModel: searchRegex },
            { engineType: searchRegex },
            { transmission: searchRegex }
          ]
        })
        return cars
      } catch (error) {
        logger.error('Error searching cars:', error)
        throw error
      }
    },

    reviews: async (_: unknown, { carId }: { carId: string }) => {
      try {
        const car = await Car.findById(carId)
        if (!car) {
          throw new Error('Car not found')
        }
        return car.reviews ?? []
      } catch (error) {
        logger.error('Error fetching reviews:', error)
        throw error
      }
    }
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...adminResolvers.Mutation,
    admin: () => ({}),
    registerUser: async (parent: unknown, { input }: { input: { email: string, password: string, firstName: string, lastName: string } }) => {
      try {
        const user = await User.create({
          email: input.email,
          password: input.password,
          firstName: input.firstName,
          lastName: input.lastName,
          role: 'USER'
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

    loginUser: async (parent: unknown, { input }: { input: { email: string, password: string } }) => {
      try {
        const user = await User.findOne({ email: input.email })
        if (!user) {
          throw new Error('User not found')
        }

        // Skip password check for guest users
        if (user.role !== 'GUEST') {
          const isValid = await user.comparePassword(input.password)
          if (!isValid) {
            throw new Error('Invalid password')
          }
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

    createGuestUser: async (parent: unknown, args: unknown) => {
      try {
        const user = await User.create({
          firstName: `Guest_${nanoid(6)}`,
          lastName: `Guest_${nanoid(6)}`,
          email: `guest_${nanoid(8)}@temp.com`,
          password: await bcryptjs.hash('guest', 10),
          role: 'GUEST'
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

    upgradeGuestUser: async (parent: unknown, { input }: { input: { email: string, password: string, firstName: string, lastName: string } }, { user }: IContext) => {
      if (!user || user.role !== 'GUEST') {
        throw new Error('Only guest users can be upgraded')
      }

      try {
        user.email = input.email
        user.password = input.password
        user.firstName = input.firstName
        user.lastName = input.lastName
        user.role = 'USER'

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

    updateUser: async (parent: unknown, { input }: { input: Partial<IUser> }, { user }: IContext) => {
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

    createReview: async (parent: unknown, { input }: { input: ReviewInput }, { user }: IContext) => {
      if (!user) {
        throw new Error('Not authenticated')
      }

      try {
        const car = await Car.findById(input.carId)
        if (!car) {
          throw new Error('Car not found')
        }

        const userId = (user as IUser & { _id: mongoose.Types.ObjectId })._id

        const review = {
          user: {
            id: userId.toString(),
            firstName: user.firstName,
            lastName: user.lastName
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

        // Update car rating
        const totalRating = car.reviews.reduce((sum, r) => sum + r.rating, 0)
        car.rating = totalRating / car.reviews.length
        await car.save()

        return review
      } catch (error) {
        logger.error('Error creating review:', error)
        throw error
      }
    },

    updateReview: async (parent: unknown, { id, rating, comment }: { id: string, rating: number, comment: string }, { user }: IContext) => {
      if (!user) {
        throw new Error('Not authenticated')
      }

      try {
        const car = await Car.findOne({ 'reviews._id': id })
        if (!car) {
          throw new Error('Review not found')
        }

        const userId = (user as IUser & { _id: mongoose.Types.ObjectId })._id

        const review = car.reviews?.find(r => r.user.id === userId.toString())
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

    deleteReview: async (parent: unknown, { id }: { id: string }, { user }: IContext) => {
      if (!user) {
        throw new Error('Not authenticated')
      }

      try {
        const car = await Car.findOne({ 'reviews._id': id })
        if (!car) {
          throw new Error('Review not found')
        }

        const userId = (user as IUser & { _id: mongoose.Types.ObjectId })._id

        const reviewIndex = car.reviews?.findIndex(r => r.user.id === userId.toString()) ?? -1
        if (reviewIndex === -1 || car.reviews?.[reviewIndex]?.user.id !== userId.toString()) {
          throw new Error('Not authorized to delete this review')
        }

        const review = car.reviews?.[reviewIndex]
        car.reviews?.splice(reviewIndex, 1)
        await car.save()

        return review
      } catch (error) {
        logger.error('Error deleting review:', error)
        throw error
      }
    }
  },

  Car: {
    ...carResolvers.Car,
    reviews: async (parent: ICar) => {
      return parent.reviews ?? []
    }
  },

  Review: {
    user: async (parent: IReview) => {
      return parent.user
    }
  }
}
