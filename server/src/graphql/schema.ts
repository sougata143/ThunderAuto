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
    role: String!
    isGuest: Boolean!
    lastLogin: String
    preferences: UserPreferences!
    createdAt: String!
    updatedAt: String!
    reviews: [Review]
  }

  type UserPreferences {
    theme: String!
    notifications: Boolean!
    language: String!
  }

  type AuthResponse {
    user: User!
    token: String!
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

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    name: String
    email: String
    password: String
    preferences: UserPreferencesInput
  }

  input UserPreferencesInput {
    theme: String
    notifications: Boolean
    language: String
  }

  input CreateReviewInput {
    carId: ID!
    rating: Int!
    comment: String
  }

  type Query {
    me: User
    cars(filter: CarFilter, limit: Int, offset: Int): [Car]!
    car(id: ID!): Car
    compareCars(ids: [ID!]!): [Car]!
    searchCars(query: String!): [Car]!
    reviews(carId: ID!): [Review]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthResponse!
    login(input: LoginInput!): AuthResponse!
    createGuestUser: AuthResponse!
    upgradeGuestUser(input: RegisterInput!): AuthResponse!
    updateUser(input: UpdateUserInput!): User!
    createReview(input: CreateReviewInput!): Review!
    updateReview(id: ID!, rating: Int, comment: String): Review!
    deleteReview(id: ID!): Boolean!
  }
`
