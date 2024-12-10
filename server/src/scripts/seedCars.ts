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
    engineType: 'ELECTRIC',
    transmission: 'AUTOMATIC',
    power: 1020,
    acceleration: 2.1,
    status: 'PUBLISHED',
    specs: {
      transmission: {
        type: 'AUTOMATIC',
        gears: 1,
        driveType: 'ALL_WHEEL_DRIVE',
        differential: 'Electronic'
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
      fuel: {
        fuelType: 'Electric',
        fuelSystem: 'N/A',
        tankCapacity: 0,
        cityMPG: 0,
        highwayMPG: 0,
        combinedMPG: 0,
        emissionClass: 'Zero Emission'
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
    engineType: 'GASOLINE',
    transmission: 'SEMI_AUTOMATIC',
    power: 518,
    acceleration: 3.2,
    status: 'PUBLISHED',
    specs: {
      transmission: {
        type: 'SEMI_AUTOMATIC',
        gears: 7,
        clutchType: 'DUAL_CLUTCH',
        driveType: 'REAR_WHEEL_DRIVE',
        differential: 'Electronic LSD'
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
      fuel: {
        fuelType: 'Premium Unleaded',
        fuelSystem: 'Direct Injection',
        tankCapacity: 16.9,
        cityMPG: 15,
        highwayMPG: 19,
        combinedMPG: 17,
        emissionClass: 'Euro 6'
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
    engineType: 'ELECTRIC',
    transmission: 'AUTOMATIC',
    power: 1234,
    acceleration: 1.89,
    status: 'PUBLISHED',
    specs: {
      transmission: {
        type: 'AUTOMATIC',
        gears: 1,
        driveType: 'ALL_WHEEL_DRIVE',
        differential: 'Electronic'
      },
      interior: {
        seatingCapacity: 5,
        doors: 4,
        trunkCapacity: 32,
        infotainmentScreen: '21-inch Touchscreen',
        soundSystem: 'Dolby Atmos Sound System',
        climateZones: 3,
        upholsteryMaterial: 'Premium Leather'
      },
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
      fuel: {
        fuelType: 'Electric',
        fuelSystem: 'N/A',
        tankCapacity: 0,
        cityMPG: 0,
        highwayMPG: 0,
        combinedMPG: 0,
        emissionClass: 'Zero Emission'
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
    engineType: 'GASOLINE',
    transmission: 'AUTOMATIC',
    power: 627,
    acceleration: 2.9,
    status: 'PUBLISHED',
    specs: {
      transmission: {
        type: 'AUTOMATIC',
        gears: 8,
        driveType: 'ALL_WHEEL_DRIVE',
        differential: 'Electronic Active'
      },
      interior: {
        seatingCapacity: 4,
        doors: 4,
        trunkCapacity: 14,
        infotainmentScreen: '12.3-inch Touchscreen',
        soundSystem: 'Harman Kardon Surround Sound',
        climateZones: 4,
        upholsteryMaterial: 'Merino Leather'
      },
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
      fuel: {
        fuelType: 'Premium Unleaded',
        fuelSystem: 'Direct Injection',
        tankCapacity: 20.6,
        cityMPG: 15,
        highwayMPG: 21,
        combinedMPG: 17,
        emissionClass: 'Euro 6'
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
    engineType: 'PLUG_IN_HYBRID',
    transmission: 'AUTOMATIC',
    power: 831,
    acceleration: 2.9,
    status: 'PUBLISHED',
    specs: {
      transmission: {
        type: 'AUTOMATIC',
        gears: 9,
        driveType: 'ALL_WHEEL_DRIVE',
        differential: 'Electronic Performance'
      },
      interior: {
        seatingCapacity: 4,
        doors: 4,
        trunkCapacity: 12.8,
        infotainmentScreen: '12.3-inch MBUX Touchscreen',
        soundSystem: 'Burmester 3D Surround Sound',
        climateZones: 3,
        upholsteryMaterial: 'Nappa Leather'
      },
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
      fuel: {
        fuelType: 'Premium Unleaded',
        fuelSystem: 'Direct Injection',
        tankCapacity: 21.1,
        cityMPG: 15,
        highwayMPG: 22,
        combinedMPG: 18,
        emissionClass: 'Euro 6'
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

export async function seedCars() {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thunderauto')
    }

    // Find or create an admin user for seeding
    let adminUser = await User.findOne({ role: 'ADMIN' })
    if (!adminUser) {
      adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@thunderauto.com',
        role: 'ADMIN',
        password: 'admin123' // Updated to match the login attempt
      })
      await adminUser.save()
    }

    // Seed cars with the admin user
    const carsWithCreator = latestCars.map(car => ({
      ...car,
      createdBy: adminUser._id,
      lastUpdatedBy: adminUser._id
    }))

    // Insert cars into the database
    await Car.insertMany(carsWithCreator)

    console.log('Cars seeded successfully!')
  } catch (error) {
    console.error('Error seeding cars:', error)
    throw error
  }
}
