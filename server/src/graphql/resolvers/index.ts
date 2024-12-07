import { adminResolvers } from './admin.resolver'
import { carResolvers } from './car.resolver'
import { DateTimeResolver } from 'graphql-scalars'

// Combine all resolvers
export const resolvers = {
  DateTime: DateTimeResolver,
  Query: {
    ...carResolvers.Query,
    ...adminResolvers.Query
  },
  Mutation: {
    ...adminResolvers.Mutation
  },
  Car: {
    ...carResolvers.Car
  }
}
