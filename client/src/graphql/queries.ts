import { gql } from '@apollo/client'

export const GET_CARS = gql`
  query GetCars {
    cars {
      id
      make
      carModel
      year
      price
      images {
        url
        isFeatured
        caption
        uploadedBy {
          id
          name
        }
        uploadedAt
      }
      rating
      engineType
      transmission
      power
      acceleration
    }
  }
`

export const GET_CAR_DETAILS = gql`
  query GetCarDetails($id: ID!) {
    car(id: $id) {
      id
      make
      carModel
      year
      price
      images {
        url
        isFeatured
        caption
        uploadedBy {
          id
          name
        }
        uploadedAt
      }
      rating
      engineType
      transmission
      power
      acceleration
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
        fuel {
          tankCapacity
          fuelType
          fuelSystem
          cityMPG
          highwayMPG
          combinedMPG
          emissionClass
        }
        interior {
          seatingCapacity
          doors
          trunkCapacity
          infotainmentScreen
          soundSystem
          climateZones
          upholsteryMaterial
        }
        safety {
          airbags
          abs
          stabilityControl
          tractionControl
          parkingSensors
          camera
          blindSpotMonitoring
          laneDepartureWarning
          collisionWarning
          nightVision
        }
        technology {
          connectivity
          smartphone
          navigation
          headlightType
          adaptiveCruiseControl
          keylessEntry
          startSystem
          driverAssistance
        }
        warranty {
          basic
          powertrain
          corrosion
          roadside
          maintenance
        }
      }
      reviews {
        user {
          id
          name
        }
        rating
        comment
        createdAt
      }
    }
  }
`

export const GET_COMPARE_CARS = gql`
  query GetCompareCars($ids: [ID!]!) {
    compareCars(ids: $ids) {
      id
      make
      carModel
      year
      price
      engineType
      transmission
      fuelType
      power
      acceleration
      topSpeed
      specs {
        dimensions {
          length
          width
          height
          wheelbase
        }
        weight
        fuelCapacity
        trunkCapacity
        seatingCapacity
      }
    }
  }
`

export const SEARCH_CARS = gql`
  query SearchCars($query: String!) {
    searchCars(query: $query) {
      id
      make
      carModel
      year
      price
      images {
        url
        isFeatured
        caption
        uploadedBy {
          id
          name
        }
        uploadedAt
      }
      rating
      engineType
      transmission
      power
      acceleration
    }
  }
`

export const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      role
      isGuest
      preferences {
        theme
        notifications
        language
      }
    }
  }
`
