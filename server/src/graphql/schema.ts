export const typeDefs = `#graphql
  type Car {
    id: ID!
    make: String!
    model: String!
    year: Int!
    price: Float
    engineType: String
    transmission: String
    fuelType: String
    mileage: Float
    power: Int
    acceleration: Float
    topSpeed: Int
    images: [String]
    specs: CarSpecs
    reviews: [Review]
    rating: Float
  }

  type CarSpecs {
    dimensions: Dimensions
    weight: Int
    fuelCapacity: Float
    trunkCapacity: Int
    seatingCapacity: Int
    groundClearance: Float
  }

  type Dimensions {
    length: Float
    width: Float
    height: Float
    wheelbase: Float
  }

  type Review {
    id: ID!
    user: User!
    rating: Int!
    comment: String
    createdAt: String!
    updatedAt: String
  }

  type User {
    id: ID!
    name: String!
    email: String!
    reviews: [Review]
  }

  input CarFilter {
    make: String
    model: String
    year: Int
    minPrice: Float
    maxPrice: Float
    engineType: String
    transmission: String
    fuelType: String
  }

  type Query {
    cars(filter: CarFilter, limit: Int, offset: Int): [Car]!
    car(id: ID!): Car
    compareCars(ids: [ID!]!): [Car]!
    searchCars(query: String!): [Car]!
    reviews(carId: ID!): [Review]!
  }

  input CreateReviewInput {
    carId: ID!
    rating: Int!
    comment: String
  }

  type Mutation {
    createReview(input: CreateReviewInput!): Review!
    updateReview(id: ID!, rating: Int, comment: String): Review!
    deleteReview(id: ID!): Boolean!
  }
`
