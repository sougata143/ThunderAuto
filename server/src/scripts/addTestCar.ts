import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Car } from '../models/Car'
import { User } from '../models/User'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thunderauto'

async function addTestCar() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Get admin user
    const admin = await User.findOne({ email: 'admin@thunderauto.com' })
    if (!admin) {
      console.error('Admin user not found')
      return
    }

    // Create test car
    const testCar = {
      make: 'Tesla',
      carModel: 'Model S',
      year: 2024,
      price: 89990,
      engineType: 'Electric',
      transmission: 'Single-Speed',
      power: 670,
      acceleration: 3.1,
      status: 'published',
      createdBy: admin._id,
      lastUpdatedBy: admin._id,
      specs: {
        engine: {
          displacement: 0,
          cylinders: 0,
          configuration: 'Electric Motors',
          fuelInjection: 'N/A',
          turbocharger: false,
          supercharger: false,
          compression: 'N/A',
          valvesPerCylinder: 0
        },
        performance: {
          powerToWeight: 4.2,
          topSpeed: 155,
          acceleration060: 3.1,
          acceleration0100: 6.2,
          quarterMile: 11.8,
          brakingDistance60_0: 110
        },
        chassis: {
          bodyType: 'Sedan',
          platform: 'Tesla Platform',
          frontSuspension: 'Double Wishbone',
          rearSuspension: 'Multi-Link',
          frontBrakes: 'Ventilated Disc',
          rearBrakes: 'Ventilated Disc',
          wheelSize: '19"',
          tireSize: '245/45R19'
        },
        dimensions: {
          length: 196.0,
          width: 77.3,
          height: 57.0,
          wheelbase: 116.5,
          groundClearance: 5.5,
          dragCoefficient: 0.208,
          weight: 4561,
          distribution: '48/52'
        },
        transmission: {
          type: 'Single-Speed',
          gears: 1,
          clutchType: 'N/A',
          driveType: 'AWD',
          differential: 'Electronic'
        },
        fuel: {
          fuelType: 'Electric',
          fuelSystem: 'Battery',
          tankCapacity: 100,
          cityMPG: 124,
          highwayMPG: 115,
          combinedMPG: 120,
          emissionClass: 'Zero Emissions'
        },
        interior: {
          seatingCapacity: 5,
          doors: 4,
          trunkCapacity: 28,
          infotainmentScreen: '17" Touchscreen',
          soundSystem: 'Premium Audio',
          climateZones: 3,
          upholsteryMaterial: 'Synthetic Leather'
        },
        safety: {
          airbags: 'Multiple',
          abs: true,
          stabilityControl: true,
          tractionControl: true,
          parkingSensors: true,
          camera: '360-degree',
          blindSpotMonitoring: true,
          laneDepartureWarning: true,
          collisionWarning: true,
          nightVision: false
        },
        technology: {
          connectivity: ['Bluetooth', 'WiFi', 'USB-C'],
          smartphone: ['Apple CarPlay', 'Android Auto'],
          navigation: 'Built-in GPS',
          headlightType: 'LED Matrix',
          adaptiveCruiseControl: true,
          keylessEntry: true,
          startSystem: 'Keyless',
          driverAssistance: ['Autopilot', 'Parking Assist']
        },
        warranty: {
          basic: '4 years/50,000 miles',
          powertrain: '8 years/150,000 miles',
          corrosion: '12 years/unlimited',
          roadside: '4 years/50,000 miles',
          maintenance: '4 years/50,000 miles'
        },
        features: {
          safety: ['Automatic Emergency Braking', 'Forward Collision Warning'],
          comfort: ['Heated Seats', 'Air Suspension'],
          technology: ['Autopilot', 'Sentry Mode'],
          exterior: ['Glass Roof', 'Power Folding Mirrors'],
          interior: ['Premium Audio', 'Ambient Lighting']
        }
      }
    }

    const car = await Car.create(testCar)
    console.log('Test car created successfully')
    console.log('Car ID:', car._id)
    console.log('Car Details:', JSON.stringify(car, null, 2))

  } catch (error) {
    console.error('Error creating test car:', error)
  } finally {
    await mongoose.disconnect()
  }
}

addTestCar()
