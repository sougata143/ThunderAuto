import mongoose from 'mongoose'
import { logger } from '../utils/logger'

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thunderauto'
  
  try {
    await mongoose.connect(MONGODB_URI)
    logger.info('📦 Connected to MongoDB')
  } catch (error) {
    logger.error('MongoDB connection error:', error)
    process.exit(1)
  }
  
  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error:', error)
  })
}
