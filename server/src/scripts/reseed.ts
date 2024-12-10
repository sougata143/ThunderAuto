import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Car } from '../models/Car'
import { User } from '../models/User'
import { seedCars } from './seedCars'

dotenv.config()

async function reseedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thunderauto')
    
    // Clear existing collections
    await Car.deleteMany({})
    await User.deleteMany({})
    
    console.log('Existing data cleared.')
    
    // Run seeding scripts
    await seedCars()
    
    console.log('Database reseeded successfully.')
    
    // Close the connection
    await mongoose.connection.close()
  } catch (error) {
    console.error('Error reseeding database:', error)
    process.exit(1)
  }
}

reseedDatabase()
