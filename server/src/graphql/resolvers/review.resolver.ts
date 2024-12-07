import { Car } from '../../models/Car'
import { IContext } from '../../types/context'
import { logger } from '../../utils/logger'

interface ReviewInput {
  carId: string
  rating: number
  comment: string
}

export const reviewResolvers = {
  Query: {
    reviews: async (_: unknown, { carId }: { carId: string }, _context: IContext) => {
      try {
        const car = await Car.findById(carId)
          .populate('reviews.user.id', 'firstName lastName email')
        
        if (!car) {
          throw new Error('Car not found')
        }

        return car.reviews
      } catch (error) {
        logger.error('Error fetching reviews:', error)
        throw error
      }
    }
  },

  Mutation: {
    createReview: async (_: unknown, { input }: { input: ReviewInput }, { user }: IContext) => {
      try {
        if (!user) {
          throw new Error('You must be logged in to create a review')
        }

        const car = await Car.findById(input.carId)
        if (!car) {
          throw new Error('Car not found')
        }

        // Add the new review
        const review = {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName
          },
          rating: input.rating,
          comment: input.comment,
          createdAt: new Date()
        }

        car.reviews.push(review)

        // Update car's average rating
        const totalRating = car.reviews.reduce((sum, review) => sum + review.rating, 0)
        car.rating = totalRating / car.reviews.length

        await car.save()

        return review
      } catch (error) {
        logger.error('Error creating review:', error)
        throw error
      }
    },

    updateReview: async (_: unknown, { id, rating, comment }: { id: string; rating: number; comment: string }, { user }: IContext) => {
      try {
        if (!user) {
          throw new Error('You must be logged in to update a review')
        }

        const car = await Car.findOne({ 'reviews._id': id })
        if (!car) {
          throw new Error('Review not found')
        }

        const review = car.reviews.id(id)
        if (!review) {
          throw new Error('Review not found')
        }

        if (review.user.id.toString() !== user.id) {
          throw new Error('You can only update your own reviews')
        }

        // Update the review
        review.rating = rating
        review.comment = comment

        // Update car's average rating
        const totalRating = car.reviews.reduce((sum, review) => sum + review.rating, 0)
        car.rating = totalRating / car.reviews.length

        await car.save()

        return review
      } catch (error) {
        logger.error('Error updating review:', error)
        throw error
      }
    },

    deleteReview: async (_: unknown, { id }: { id: string }, { user }: IContext) => {
      try {
        if (!user) {
          throw new Error('You must be logged in to delete a review')
        }

        const car = await Car.findOne({ 'reviews._id': id })
        if (!car) {
          throw new Error('Review not found')
        }

        const review = car.reviews.id(id)
        if (!review) {
          throw new Error('Review not found')
        }

        if (review.user.id.toString() !== user.id && user.role !== 'ADMIN') {
          throw new Error('You can only delete your own reviews')
        }

        // Remove the review
        car.reviews.pull({ _id: id })

        // Update car's average rating
        const totalRating = car.reviews.reduce((sum, review) => sum + review.rating, 0)
        car.rating = car.reviews.length > 0 ? totalRating / car.reviews.length : 0

        await car.save()

        return true
      } catch (error) {
        logger.error('Error deleting review:', error)
        throw error
      }
    }
  },

  Review: {
    user: async (parent: any) => {
      // If the user is already populated with firstName and lastName, return it
      if (parent.user.firstName && parent.user.lastName) {
        return parent.user
      }

      // Otherwise, return the user object with id only
      // The ReviewUser type in the schema will handle the rest
      return { id: parent.user.id }
    }
  }
}
