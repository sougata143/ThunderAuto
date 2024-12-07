import { adminResolvers } from './admin.resolver'
import { carResolvers } from './car.resolver'
import { authResolvers } from './auth.resolver'
import { reviewResolvers } from './review.resolver'
import { DateTimeResolver } from 'graphql-scalars'

// Combine all resolvers
export const resolvers = {
  DateTime: DateTimeResolver,
  Query: {
    ...carResolvers.Query,
    ...adminResolvers.Query,
    ...reviewResolvers.Query
  },
  Mutation: {
    ...adminResolvers.Mutation,
    ...authResolvers.Mutation,
    ...reviewResolvers.Mutation
  },
  Car: {
    ...carResolvers.Car
  },
  Review: {
    ...reviewResolvers.Review
  }
}
