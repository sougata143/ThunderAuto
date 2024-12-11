import mongoose from 'mongoose';
import { config } from 'dotenv';
import { logger } from '../utils/logger';

config();

export const connectDB = async (uri?: string) => {
  try {
    const mongoURI = uri || process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined');
    }
    
    logger.info('🔍 Attempting to connect to MongoDB', { uri: mongoURI });
    
    // Explicitly set mongoose connection options
    mongoose.set('strictQuery', true);
    
    // Global connection with more comprehensive error handling
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // Increased timeout to 30 seconds
      socketTimeoutMS: 60000, // Increased socket timeout to 1 minute
      connectTimeoutMS: 30000, // Connection timeout
      retryWrites: true,
      w: 'majority'
    });
    
    const connection = mongoose.connection;
    
    connection.on('connected', () => {
      logger.info('📦 Connected to MongoDB successfully', {
        dbName: connection.db?.databaseName || 'Unknown',
        host: connection.host,
        port: connection.port
      });
    });
    
    connection.on('error', (error) => {
      logger.error('Comprehensive Mongoose Connection Error:', {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        connectionDetails: {
          uri: mongoURI,
          readyState: connection.readyState
        }
      });
    });
    
    connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB. Attempting to reconnect...');
      mongoose.connect(mongoURI);
    });
    
    return connection;
  } catch (err) {
    logger.error('Fatal Error Connecting to MongoDB:', {
      errorName: err instanceof Error ? err.name : 'Unknown Error',
      errorMessage: err instanceof Error ? err.message : 'No error message',
      errorStack: err instanceof Error ? err.stack : 'No stack trace',
      mongoUri: process.env.MONGODB_URI
    });
    
    throw err;
  }
};
