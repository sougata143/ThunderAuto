import mongoose from 'mongoose';
import { Car } from '../models/Car';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thunderauto';

async function migrateCarStatus() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all documents with lowercase status to uppercase
    const result = await Car.updateMany(
      { status: { $in: ['draft', 'published', 'archived'] } },
      [
        {
          $set: {
            status: {
              $switch: {
                branches: [
                  { case: { $eq: ['$status', 'draft'] }, then: 'DRAFT' },
                  { case: { $eq: ['$status', 'published'] }, then: 'PUBLISHED' },
                  { case: { $eq: ['$status', 'archived'] }, then: 'ARCHIVED' }
                ],
                default: '$status'
              }
            }
          }
        }
      ]
    );

    console.log(`Updated ${result.modifiedCount} documents`);
  } catch (error) {
    console.error('Error migrating car status:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateCarStatus();
