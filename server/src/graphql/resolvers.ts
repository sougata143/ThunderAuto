import { Car } from '../models/Car'
import { Review } from '../models/Review'
import { User } from '../models/User'
import { createRedisClient } from '../config/redis'
import { logger } from '../utils/logger'

export const resolvers = {
  Query: {
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
        
        // Cache the result
        await redis.set(cacheKey, JSON.stringify(car), 'EX', 3600) // Cache for 1 hour
        
        return car
      } catch (error) {
        logger.error('Error fetching car:', error)
        throw new Error('Failed to fetch car')
      }
    },

    compareCars: async (_, { ids }) => {
      try {
        return await Car.find({ _id: { $in: ids } })
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
    createReview: async (_, { input }, context) => {
      try {
        const { carId, rating, comment } = input
        const userId = context.user?.id

        if (!userId) {
          throw new Error('Authentication required')
        }

        const car = await Car.findById(carId)
        if (!car) {
          throw new Error('Car not found')
        }

        const review = await Review.create({
          car: carId,
          user: userId,
          rating,
          comment
        })

        // Update car's average rating
        const reviews = await Review.find({ car: carId })
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        await Car.findByIdAndUpdate(carId, { rating: avgRating })

        return await review.populate('user')
      } catch (error) {
        logger.error('Error creating review:', error)
        throw new Error('Failed to create review')
      }
    },

    updateReview: async (_, { id, rating, comment }, context) => {
      try {
        const userId = context.user?.id
        if (!userId) {
          throw new Error('Authentication required')
        }

        const review = await Review.findOne({ _id: id, user: userId })
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
      } catch (error) {
        logger.error('Error updating review:', error)
        throw new Error('Failed to update review')
      }
    },

    deleteReview: async (_, { id }, context) => {
      try {
        const userId = context.user?.id
        if (!userId) {
          throw new Error('Authentication required')
        }

        const review = await Review.findOne({ _id: id, user: userId })
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
      } catch (error) {
        logger.error('Error deleting review:', error)
        throw new Error('Failed to delete review')
      }
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
