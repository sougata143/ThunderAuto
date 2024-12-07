import { gql } from '@apollo/client'

export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      rating
      comment
      createdAt
      user {
        id
        name
      }
    }
  }
`

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($id: ID!, $rating: Int, $comment: String) {
    updateReview(id: $id, rating: $rating, comment: $comment) {
      id
      rating
      comment
      createdAt
      user {
        id
        name
      }
    }
  }
`

export const DELETE_REVIEW = gql`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id)
  }
`

export const ADD_TO_FAVORITES = gql`
  mutation AddToFavorites($carId: ID!) {
    addToFavorites(carId: $carId) {
      id
      make
      model
      year
    }
  }
`

export const REMOVE_FROM_FAVORITES = gql`
  mutation RemoveFromFavorites($carId: ID!) {
    removeFromFavorites(carId: $carId)
  }
`

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      email
    }
  }
`
