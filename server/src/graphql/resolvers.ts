import { AuthService } from '../services/auth.service'
import { Car } from '../models/Car'
import { Review } from '../models/Review'
import { User } from '../models/User'
import { createRedisClient } from '../config/redis'
import { logger } from '../utils/logger'

export const resolvers = {
  Query: {
    me: (_, __, { user }) => {
      return user
    },
    cars: async (_, { filter = {}, limit = 20, offset = 0 }) => {
      try {
        const query: any = {}
        
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
        throw new Error('Failed to fetch cars')
      }
    },

    car: async (_, { id }) => {
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

        // Cache for 1 hour
        await redis.setex(cacheKey, 3600, JSON.stringify(car))
        return car
      } catch (error) {
        logger.error('Error fetching car:', error)
        throw new Error('Failed to fetch car')
      }
    },

    compareCars: async (_, { ids }) => {
      try {
        const redis = await createRedisClient()
        const cacheKey = `compare:${ids.sort().join(',')}`
        
        // Try to get from cache
        const cachedCars = await redis.get(cacheKey)
        if (cachedCars) {
          return JSON.parse(cachedCars)
        }
        
        // Get from database
        const cars = await Car.find({ _id: { $in: ids } })
        if (!cars || cars.length !== ids.length) {
          throw new Error('One or more cars not found')
        }

        // Cache for 1 hour
        await redis.setex(cacheKey, 3600, JSON.stringify(cars))
        return cars
      } catch (error) {
        logger.error('Error comparing cars:', error)
        throw new Error('Failed to compare cars')
      }
    },

    searchCars: async (_, { query }) => {
      try {
        const searchRegex = new RegExp(query, 'i')
        return await Car.find({
          $or: [
            { make: searchRegex },
            { model: searchRegex },
            { engineType: searchRegex },
            { transmission: searchRegex },
            { fuelType: searchRegex }
          ]
        }).limit(20)
      } catch (error) {
        logger.error('Error searching cars:', error)
        throw new Error('Failed to search cars')
      }
    },

    reviews: async (_, { carId }) => {
      try {
        return await Review.find({ car: carId })
          .populate('user')
          .sort({ createdAt: -1 })
      } catch (error) {
        logger.error('Error fetching reviews:', error)
        throw new Error('Failed to fetch reviews')
      }
    }
  },

  Mutation: {
    register: async (_, { input }) => {
      return AuthService.registerUser(input.name, input.email, input.password)
    },

    login: async (_, { input }) => {
      return AuthService.loginUser(input.email, input.password)
    },

    createGuestUser: async () => {
      return AuthService.createGuestUser()
    },

    upgradeGuestUser: async (_, { input }, { user }) => {
      if (!user || !user.isGuest) {
        throw new Error('Only guest users can be upgraded')
      }
      return AuthService.upgradeGuestUser(user.id, input.name, input.email, input.password)
    },

    updateUser: async (_, { input }, { user }) => {
      if (!user) {
        throw new Error('Authentication required')
      }

      try {
        if (input.email) {
          const existingUser = await User.findOne({ email: input.email })
          if (existingUser && existingUser.id !== user.id) {
            throw new Error('Email already in use')
          }
        }

        Object.assign(user, input)
        if (input.preferences) {
          Object.assign(user.preferences, input.preferences)
        }

        await user.save()
        return user
      } catch (error) {
        logger.error('Error updating user:', error)
        throw error
      }
    },

    createReview: async (_, { input }, { user }) => {
      if (!user) {
        throw new Error('Authentication required')
      }

      if (user.isGuest) {
        throw new Error('Guest users cannot create reviews')
      }

      try {
        const car = await Car.findById(input.carId)
        if (!car) {
          throw new Error('Car not found')
        }

        const review = await Review.create({
          car: input.carId,
          user: {
            id: user.id,
            name: user.name
          },
          rating: input.rating,
          comment: input.comment
        })

        return review
      } catch (error) {
        logger.error('Error creating review:', error)
        throw error
      }
    },

    updateReview: async (_, { id, rating, comment }, { user }) => {
      if (!user) {
        throw new Error('Authentication required')
      }

      const review = await Review.findOne({ _id: id, user: user.id })
      if (!review) {
        throw new Error('Review not found or unauthorized')
      }

      if (rating) review.rating = rating
      if (comment) review.comment = comment

      await review.save()

      // Update car's average rating
      const reviews = await Review.find({ car: review.car })
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      await Car.findByIdAndUpdate(review.car, { rating: avgRating })

      return await review.populate('user')
    },

    deleteReview: async (_, { id }, { user }) => {
      if (!user) {
        throw new Error('Authentication required')
      }

      const review = await Review.findOne({ _id: id, user: user.id })
      if (!review) {
        throw new Error('Review not found or unauthorized')
      }

      await review.deleteOne()

      // Update car's average rating
      const reviews = await Review.find({ car: review.car })
      const avgRating = reviews.length 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0
      await Car.findByIdAndUpdate(review.car, { rating: avgRating })

      return true
    }
  },

  Car: {
    reviews: async (parent) => {
      return await Review.find({ car: parent.id }).populate('user')
    }
  },

  Review: {
    user: async (parent) => {
      return await User.findById(parent.user)
    }
  }
}
