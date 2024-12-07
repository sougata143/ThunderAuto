import mongoose from 'mongoose';
import { config } from 'dotenv';
import { logger } from '../utils/logger.js';

config();

export const connectDB = async (uri?: string) => {
  try {
    const mongoURI = uri || process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined');
    }
    
    await mongoose.connect(mongoURI);
    logger.info('📦 Connected to MongoDB');
  } catch (err) {
    logger.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
  
  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error:', error);
  });
};
