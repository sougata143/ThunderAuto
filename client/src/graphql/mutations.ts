import { gql } from '@apollo/client'

export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterUserInput!) {
    registerUser(input: $input) {
      token
      user {
        id
        firstName
        lastName
        email
        role
        preferences {
          theme
          notifications
          language
        }
      }
    }
  }
`

export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginUserInput!) {
    loginUser(input: $input) {
      token
      user {
        id
        firstName
        lastName
        email
        role
        preferences {
          theme
          notifications
          language
        }
      }
    }
  }
`

export const CREATE_GUEST_USER = gql`
  mutation CreateGuestUser {
    createGuestUser {
      token
      user {
        id
        firstName
        lastName
        email
        role
        preferences {
          theme
          notifications
          language
        }
      }
    }
  }
`

export const UPGRADE_GUEST_USER = gql`
  mutation UpgradeGuestUser($input: RegisterUserInput!) {
    upgradeGuestUser(input: $input) {
      token
      user {
        id
        firstName
        lastName
        email
        role
        preferences {
          theme
          notifications
          language
        }
      }
    }
  }
`

export const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      firstName
      lastName
      email
      role
      preferences {
        theme
        notifications
        language
      }
    }
  }
`

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: ReviewInput!) {
    createReview(input: $input) {
      id
      rating
      comment
      createdAt
      user {
        id
        firstName
        lastName
      }
    }
  }
`

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($id: ID!, $rating: Float!, $comment: String!) {
    updateReview(id: $id, rating: $rating, comment: $comment) {
      id
      rating
      comment
      createdAt
      user {
        id
        firstName
        lastName
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
      firstName
      lastName
      email
    }
  }
`

export const CREATE_CAR = gql`
  mutation CreateCar($input: CarInput!) {
    admin {
      createCar(input: $input) {
        id
        make
        carModel
        year
        price
        engineType
        transmission
        power
        acceleration
        status
        images {
          url
          isFeatured
          caption
          uploadedBy {
            id
            firstName
            lastName
          }
          uploadedAt
        }
        specs {
          engine {
            displacement
            cylinders
            configuration
            fuelInjection
            turbocharger
            supercharger
            compression
            valvesPerCylinder
          }
          performance {
            powerToWeight
            topSpeed
            acceleration060
            acceleration0100
            quarterMile
            brakingDistance60_0
          }
          chassis {
            bodyType
            platform
            frontSuspension
            rearSuspension
            frontBrakes
            rearBrakes
            wheelSize
            tireSize
          }
          dimensions {
            length
            width
            height
            wheelbase
            groundClearance
            dragCoefficient
            weight
            distribution
          }
        }
        createdBy {
          id
          firstName
          lastName
        }
        lastUpdatedBy {
          id
          firstName
          lastName
        }
        createdAt
        updatedAt
      }
    }
  }
`

export const UPDATE_CAR = gql`
  mutation UpdateCar($id: ID!, $input: CarInput!) {
    admin {
      updateCar(id: $id, input: $input) {
        id
        make
        carModel
        year
        price
        engineType
        transmission
        power
        acceleration
        status
        images {
          url
          isFeatured
          caption
          uploadedBy {
            id
            firstName
            lastName
          }
          uploadedAt
        }
        specs {
          engine {
            displacement
            cylinders
            configuration
            fuelInjection
            turbocharger
            supercharger
            compression
            valvesPerCylinder
          }
          performance {
            powerToWeight
            topSpeed
            acceleration060
            acceleration0100
            quarterMile
            brakingDistance60_0
          }
          chassis {
            bodyType
            platform
            frontSuspension
            rearSuspension
            frontBrakes
            rearBrakes
            wheelSize
            tireSize
          }
          dimensions {
            length
            width
            height
            wheelbase
            groundClearance
            dragCoefficient
            weight
            distribution
          }
        }
        lastUpdatedBy {
          id
          firstName
          lastName
        }
        updatedAt
      }
    }
  }
`

export const UPDATE_CAR_STATUS = gql`
  mutation UpdateCarStatus($carId: ID!, $status: CarStatus!) {
    admin {
      updateCarStatus(carId: $carId, status: $status) {
        id
        status
        lastUpdatedBy {
          id
          firstName
          lastName
        }
        updatedAt
      }
    }
  }
`

export const DELETE_CAR = gql`
  mutation DeleteCar($id: ID!) {
    admin {
      deleteCar(id: $id) {
        success
        message
      }
    }
  }
`

export const UPLOAD_CAR_IMAGE = gql`
  mutation UploadCarImage($carId: ID!, $image: Upload!, $caption: String, $isFeatured: Boolean!) {
    admin {
      uploadCarImage(carId: $carId, image: $image, caption: $caption, isFeatured: $isFeatured) {
        id
        images {
          url
          isFeatured
          caption
          uploadedBy {
            id
            firstName
            lastName
          }
          uploadedAt
        }
      }
    }
  }
`

export const DELETE_CAR_IMAGE = gql`
  mutation DeleteCarImage($carId: ID!, $imageUrl: String!) {
    admin {
      deleteCarImage(carId: $carId, imageUrl: $imageUrl) {
        id
        images {
          url
          isFeatured
          caption
        }
      }
    }
  }
`

export const CREATE_ADMIN = gql`
  mutation CreateAdmin($input: RegisterUserInput!) {
    registerUser(input: $input) {
      token
      user {
        id
        firstName
        lastName
        email
        role
        preferences {
          theme
          notifications
          language
        }
      }
    }
  }
`

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $role: UserRole!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      firstName
      lastName
      email
      role
      preferences {
        theme
        notifications
        language
      }
    }
  }
`
