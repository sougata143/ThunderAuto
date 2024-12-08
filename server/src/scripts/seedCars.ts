import mongoose from 'mongoose'
import { Car } from '../models/Car'
import { User } from '../models/User'
import dotenv from 'dotenv'

dotenv.config()

const latestCars = [
  {
    make: 'Tesla',
    carModel: 'Model S Plaid',
    year: 2024,
    price: 89990,
    engineType: 'Electric',
    transmission: 'Single-Speed',
    power: 1020,
    acceleration: 2.1,
    status: 'PUBLISHED',
    specs: {
      engine: {
        displacement: 0,
        cylinders: 0,
        configuration: 'Triple Motor Electric',
        fuelInjection: 'N/A',
        turbocharger: false,
        supercharger: false,
        compression: 'N/A',
        valvesPerCylinder: 0
      },
      performance: {
        powerToWeight: 518,
        topSpeed: 200,
        acceleration060: 1.99,
        acceleration0100: 4.2,
        quarterMile: 9.23,
        brakingDistance60_0: 105
      },
      chassis: {
        bodyType: 'Sedan',
        platform: 'Tesla Platform',
        frontSuspension: 'Double Wishbone',
        rearSuspension: 'Multi-Link',
        frontBrakes: 'Ventilated Disc',
        rearBrakes: 'Ventilated Disc',
        wheelSize: '19-21 inch',
        tireSize: '265/35R21'
      },
      dimensions: {
        length: 197.7,
        width: 78.2,
        height: 56.3,
        wheelbase: 116.5,
        groundClearance: 4.6,
        dragCoefficient: 0.208,
        weight: 4766,
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
        fuelSystem: 'N/A',
        tankCapacity: 0,
        cityMPG: 0,
        highwayMPG: 0,
        combinedMPG: 0,
        emissionClass: 'Zero Emission'
      },
      interior: {
        seatingCapacity: 5,
        doors: 4,
        trunkCapacity: 28,
        infotainmentScreen: '17-inch Touchscreen',
        soundSystem: 'Premium 22-Speaker',
        climateZones: 3,
        upholsteryMaterial: 'Premium Leather'
      },
      safety: {
        airbags: '8 Airbags',
        abs: true,
        stabilityControl: true,
        tractionControl: true,
        parkingSensors: true,
        camera: '360-degree',
        blindSpotMonitoring: true,
        laneDepartureWarning: true,
        collisionWarning: true,
        nightVision: true
      },
      technology: {
        navigation: 'Built-in Navigation',
        headlightType: 'LED Matrix',
        adaptiveCruiseControl: true,
        keylessEntry: true,
        startSystem: 'Phone Key',
        connectivity: ['Bluetooth', 'WiFi', 'USB-C'],
        smartphone: ['Apple CarPlay', 'Android Auto'],
        driverAssistance: ['Autopilot', 'Summon', 'Auto Park']
      },
      warranty: {
        basic: '4 years/50,000 miles',
        powertrain: '8 years/150,000 miles',
        corrosion: '12 years/unlimited miles',
        roadside: '4 years/50,000 miles',
        maintenance: '4 years/50,000 miles'
      },
      features: {
        safety: ['Automatic Emergency Braking', 'Forward Collision Warning'],
        comfort: ['Heated Seats', 'Ventilated Seats', 'Massage Function'],
        technology: ['Wireless Charging', 'Premium Audio'],
        exterior: ['Glass Roof', 'Power Folding Mirrors'],
        interior: ['Ambient Lighting', 'Premium Materials']
      }
    }
  },
  {
    make: 'Porsche',
    carModel: '911 GT3 RS',
    year: 2024,
    price: 223800,
    engineType: 'Gasoline',
    transmission: '7-speed PDK',
    power: 518,
    acceleration: 3.2,
    status: 'PUBLISHED',
    specs: {
      engine: {
        displacement: 4.0,
        cylinders: 6,
        configuration: 'Flat-Six',
        fuelInjection: 'Direct Injection',
        turbocharger: false,
        supercharger: false,
        compression: '13.3:1',
        valvesPerCylinder: 4
      },
      performance: {
        powerToWeight: 353,
        topSpeed: 184,
        acceleration060: 3.2,
        acceleration0100: 6.9,
        quarterMile: 10.9,
        brakingDistance60_0: 97
      },
      chassis: {
        bodyType: 'Coupe',
        platform: '992',
        frontSuspension: 'MacPherson Strut',
        rearSuspension: 'Multi-Link',
        frontBrakes: 'Carbon Ceramic',
        rearBrakes: 'Carbon Ceramic',
        wheelSize: '20/21 inch',
        tireSize: '275/35R20 front, 335/30R21 rear'
      },
      dimensions: {
        length: 180.0,
        width: 74.8,
        height: 51.3,
        wheelbase: 96.7,
        groundClearance: 3.6,
        dragCoefficient: 0.36,
        weight: 3268,
        distribution: '40/60'
      },
      transmission: {
        type: 'PDK Dual-Clutch',
        gears: 7,
        clutchType: 'Dual-Clutch',
        driveType: 'RWD',
        differential: 'Electronic LSD'
      },
      fuel: {
        fuelType: 'Premium Unleaded',
        fuelSystem: 'Direct Injection',
        tankCapacity: 16.9,
        cityMPG: 15,
        highwayMPG: 19,
        combinedMPG: 17,
        emissionClass: 'Euro 6'
      },
      interior: {
        seatingCapacity: 2,
        doors: 2,
        trunkCapacity: 4.6,
        infotainmentScreen: '10.9-inch Touchscreen',
        soundSystem: 'Bose Surround Sound',
        climateZones: 2,
        upholsteryMaterial: 'Race-Tex'
      },
      safety: {
        airbags: '6 Airbags',
        abs: true,
        stabilityControl: true,
        tractionControl: true,
        parkingSensors: true,
        camera: 'Rear View',
        blindSpotMonitoring: true,
        laneDepartureWarning: true,
        collisionWarning: true,
        nightVision: false
      },
      technology: {
        navigation: 'Porsche Communication Management',
        headlightType: 'LED Matrix',
        adaptiveCruiseControl: true,
        keylessEntry: true,
        startSystem: 'Push Button',
        connectivity: ['Bluetooth', 'WiFi', 'USB'],
        smartphone: ['Apple CarPlay'],
        driverAssistance: ['Sport Chrono', 'Track Precision']
      },
      warranty: {
        basic: '4 years/50,000 miles',
        powertrain: '4 years/50,000 miles',
        corrosion: '12 years/unlimited miles',
        roadside: '4 years/50,000 miles',
        maintenance: '1 year/10,000 miles'
      },
      features: {
        safety: ['Ceramic Composite Brakes', 'Roll Cage'],
        comfort: ['Sport Seats Plus', 'Climate Control'],
        technology: ['Track Precision App', 'Lap Timer'],
        exterior: ['Fixed Rear Wing', 'Carbon Fiber Parts'],
        interior: ['Alcantara Steering Wheel', 'Carbon Fiber Trim']
      }
    }
  },
  {
    make: 'Lucid',
    carModel: 'Air Sapphire',
    year: 2024,
    price: 249000,
    engineType: 'Electric',
    transmission: 'Single-Speed',
    power: 1234,
    acceleration: 1.89,
    status: 'PUBLISHED',
    specs: {
      engine: {
        displacement: 0,
        cylinders: 0,
        configuration: 'Triple Motor Electric',
        fuelInjection: 'N/A',
        turbocharger: false,
        supercharger: false,
        compression: 'N/A',
        valvesPerCylinder: 0
      },
      performance: {
        powerToWeight: 563,
        topSpeed: 205,
        acceleration060: 1.89,
        acceleration0100: 3.9,
        quarterMile: 8.95,
        brakingDistance60_0: 102
      },
      chassis: {
        bodyType: 'Sedan',
        platform: 'LEAP',
        frontSuspension: 'Double Wishbone',
        rearSuspension: 'Multi-Link',
        frontBrakes: 'Carbon Ceramic',
        rearBrakes: 'Carbon Ceramic',
        wheelSize: '20/21 inch',
        tireSize: '265/35R21 front, 295/30R21 rear'
      },
      dimensions: {
        length: 195.9,
        width: 77.3,
        height: 56.8,
        wheelbase: 116.5,
        groundClearance: 5.3,
        dragCoefficient: 0.21,
        weight: 4695,
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
        fuelSystem: 'N/A',
        tankCapacity: 0,
        cityMPG: 0,
        highwayMPG: 0,
        combinedMPG: 0,
        emissionClass: 'Zero Emission'
      },
      interior: {
        seatingCapacity: 5,
        doors: 4,
        trunkCapacity: 16,
        infotainmentScreen: '34-inch Touchscreen',
        soundSystem: 'Premium 21-Speaker',
        climateZones: 3,
        upholsteryMaterial: 'Premium Leather'
      },
      safety: {
        airbags: '8 Airbags',
        abs: true,
        stabilityControl: true,
        tractionControl: true,
        parkingSensors: true,
        camera: '360-degree',
        blindSpotMonitoring: true,
        laneDepartureWarning: true,
        collisionWarning: true,
        nightVision: true
      },
      technology: {
        navigation: 'Built-in Navigation',
        headlightType: 'LED Matrix',
        adaptiveCruiseControl: true,
        keylessEntry: true,
        startSystem: 'Phone Key',
        connectivity: ['Bluetooth', 'WiFi', 'USB-C'],
        smartphone: ['Apple CarPlay', 'Android Auto'],
        driverAssistance: ['DreamDrive', 'Summon', 'Auto Park']
      },
      warranty: {
        basic: '4 years/50,000 miles',
        powertrain: '8 years/100,000 miles',
        corrosion: '12 years/unlimited miles',
        roadside: '4 years/50,000 miles',
        maintenance: '4 years/50,000 miles'
      },
      features: {
        safety: ['Automatic Emergency Braking', 'Forward Collision Warning'],
        comfort: ['Heated Seats', 'Ventilated Seats', 'Massage Function'],
        technology: ['Wireless Charging', 'Premium Audio'],
        exterior: ['Glass Roof', 'Power Folding Mirrors'],
        interior: ['Ambient Lighting', 'Premium Materials']
      }
    }
  },
  {
    make: 'BMW',
    carModel: 'M5 CS',
    year: 2024,
    price: 142000,
    engineType: 'Gasoline',
    transmission: '8-speed Automatic',
    power: 627,
    acceleration: 2.9,
    status: 'PUBLISHED',
    specs: {
      engine: {
        displacement: 4.4,
        cylinders: 8,
        configuration: 'V8',
        fuelInjection: 'Direct Injection',
        turbocharger: true,
        supercharger: false,
        compression: '10.0:1',
        valvesPerCylinder: 4
      },
      performance: {
        powerToWeight: 378,
        topSpeed: 190,
        acceleration060: 2.9,
        acceleration0100: 6.2,
        quarterMile: 10.6,
        brakingDistance60_0: 99
      },
      chassis: {
        bodyType: 'Sedan',
        platform: 'CLAR',
        frontSuspension: 'Double Wishbone',
        rearSuspension: 'Multi-Link',
        frontBrakes: 'Carbon Ceramic',
        rearBrakes: 'Carbon Ceramic',
        wheelSize: '20 inch',
        tireSize: '275/35R20 front, 285/35R20 rear'
      },
      dimensions: {
        length: 195.5,
        width: 74.9,
        height: 57.8,
        wheelbase: 117.4,
        groundClearance: 4.8,
        dragCoefficient: 0.32,
        weight: 4145,
        distribution: '47/53'
      },
      transmission: {
        type: '8-speed M Steptronic',
        gears: 8,
        clutchType: 'Torque Converter',
        driveType: 'AWD',
        differential: 'Electronic M Differential'
      },
      fuel: {
        fuelType: 'Premium Unleaded',
        fuelSystem: 'Direct Injection',
        tankCapacity: 20.6,
        cityMPG: 15,
        highwayMPG: 21,
        combinedMPG: 17,
        emissionClass: 'Euro 6'
      },
      interior: {
        seatingCapacity: 5,
        doors: 4,
        trunkCapacity: 16,
        infotainmentScreen: '12.3-inch Touchscreen',
        soundSystem: 'Premium 16-Speaker',
        climateZones: 3,
        upholsteryMaterial: 'Premium Leather'
      },
      safety: {
        airbags: '8 Airbags',
        abs: true,
        stabilityControl: true,
        tractionControl: true,
        parkingSensors: true,
        camera: '360-degree',
        blindSpotMonitoring: true,
        laneDepartureWarning: true,
        collisionWarning: true,
        nightVision: true
      },
      technology: {
        navigation: 'Built-in Navigation',
        headlightType: 'LED Laser',
        adaptiveCruiseControl: true,
        keylessEntry: true,
        startSystem: 'Push Button',
        connectivity: ['Bluetooth', 'WiFi', 'USB'],
        smartphone: ['Apple CarPlay', 'Android Auto'],
        driverAssistance: ['Active Driving Assistant', 'Parking Assistant']
      },
      warranty: {
        basic: '4 years/50,000 miles',
        powertrain: '4 years/50,000 miles',
        corrosion: '12 years/unlimited miles',
        roadside: '4 years/50,000 miles',
        maintenance: '3 years/36,000 miles'
      },
      features: {
        safety: ['Automatic Emergency Braking', 'Forward Collision Warning'],
        comfort: ['Heated Seats', 'Ventilated Seats', 'Massage Function'],
        technology: ['Wireless Charging', 'Premium Audio'],
        exterior: ['Glass Roof', 'Power Folding Mirrors'],
        interior: ['Ambient Lighting', 'Premium Materials']
      }
    }
  },
  {
    make: 'Mercedes-AMG',
    carModel: 'GT 63 S E Performance',
    year: 2024,
    price: 188050,
    engineType: 'Hybrid',
    transmission: '9-speed MCT',
    power: 831,
    acceleration: 2.9,
    status: 'PUBLISHED',
    specs: {
      engine: {
        displacement: 4.0,
        cylinders: 8,
        configuration: 'V8 + Electric Motor',
        fuelInjection: 'Direct Injection',
        turbocharger: true,
        supercharger: false,
        compression: '8.6:1',
        valvesPerCylinder: 4
      },
      performance: {
        powerToWeight: 398,
        topSpeed: 196,
        acceleration060: 2.9,
        acceleration0100: 6.1,
        quarterMile: 10.8,
        brakingDistance60_0: 101
      },
      chassis: {
        bodyType: '4-door Coupe',
        platform: 'MRA2',
        frontSuspension: 'Multi-Link',
        rearSuspension: 'Multi-Link',
        frontBrakes: 'Carbon Ceramic',
        rearBrakes: 'Carbon Ceramic',
        wheelSize: '20/21 inch',
        tireSize: '275/35R20 front, 335/30R21 rear'
      },
      dimensions: {
        length: 203.9,
        width: 76.9,
        height: 57.3,
        wheelbase: 116.2,
        groundClearance: 4.5,
        dragCoefficient: 0.32,
        weight: 4695,
        distribution: '53/47'
      },
      transmission: {
        type: '9-speed AMG SPEEDSHIFT MCT',
        gears: 9,
        clutchType: 'Torque Converter',
        driveType: 'AWD',
        differential: 'Electronic Limited Slip'
      },
      fuel: {
        fuelType: 'Premium Unleaded',
        fuelSystem: 'Direct Injection',
        tankCapacity: 21.1,
        cityMPG: 15,
        highwayMPG: 22,
        combinedMPG: 18,
        emissionClass: 'Euro 6'
      },
      interior: {
        seatingCapacity: 5,
        doors: 4,
        trunkCapacity: 12.7,
        infotainmentScreen: '12.3-inch Touchscreen',
        soundSystem: 'Premium 23-Speaker',
        climateZones: 3,
        upholsteryMaterial: 'Premium Leather'
      },
      safety: {
        airbags: '8 Airbags',
        abs: true,
        stabilityControl: true,
        tractionControl: true,
        parkingSensors: true,
        camera: '360-degree',
        blindSpotMonitoring: true,
        laneDepartureWarning: true,
        collisionWarning: true,
        nightVision: true
      },
      technology: {
        navigation: 'MBUX Navigation',
        headlightType: 'LED High Performance',
        adaptiveCruiseControl: true,
        keylessEntry: true,
        startSystem: 'Push Button',
        connectivity: ['Bluetooth', 'WiFi', 'USB'],
        smartphone: ['Apple CarPlay', 'Android Auto'],
        driverAssistance: ['Active Distance Assist', 'Active Lane Change Assist']
      },
      warranty: {
        basic: '4 years/50,000 miles',
        powertrain: '4 years/50,000 miles',
        corrosion: '12 years/unlimited miles',
        roadside: '4 years/50,000 miles',
        maintenance: '1 year/10,000 miles'
      },
      features: {
        safety: ['Automatic Emergency Braking', 'Forward Collision Warning'],
        comfort: ['Heated Seats', 'Ventilated Seats', 'Massage Function'],
        technology: ['Wireless Charging', 'Premium Audio'],
        exterior: ['Glass Roof', 'Power Folding Mirrors'],
        interior: ['Ambient Lighting', 'Premium Materials']
      }
    }
  }
]

async function seedCars() {
  try {
    // Connect to MongoDB
    const mongoUri = 'mongodb://localhost:27017/thunderauto'
    console.log('MongoDB URI:', mongoUri)
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    // Find admin user
    const adminUser = await User.findOne({ role: 'ADMIN' })
    if (!adminUser) {
      throw new Error('Admin user not found')
    }

    // Clear existing cars
    await Car.deleteMany({})
    console.log('Cleared existing cars')

    // Add created/updated by fields to each car
    const carsWithMetadata = latestCars.map(car => ({
      ...car,
      createdBy: adminUser._id,
      lastUpdatedBy: adminUser._id,
      images: [],
      rating: 0,
      reviews: []
    }))

    // Insert cars
    await Car.insertMany(carsWithMetadata)
    console.log('Added latest cars to database')

    // Disconnect from MongoDB
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  } catch (error) {
    console.error('Error seeding cars:', error)
    process.exit(1)
  }
}

// Run the seeding function
seedCars()
