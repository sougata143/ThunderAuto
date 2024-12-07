import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thunderauto';

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin user exists
    let adminUser = await User.findOne({ email: 'admin@thunderauto.com' });

    if (adminUser) {
      // Update existing user to admin
      adminUser = await User.findOneAndUpdate(
        { email: 'admin@thunderauto.com' },
        {
          role: 'ADMIN',
          password: await bcryptjs.hash('admin123', 10),
          firstName: 'Admin',
          lastName: 'User',
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en'
          }
        },
        { new: true }
      );
      console.log('Existing user updated to admin:', {
        id: adminUser?.id,
        email: adminUser?.email,
        firstName: adminUser?.firstName,
        lastName: adminUser?.lastName,
        role: adminUser?.role
      });
    } else {
      // Create new admin user
      adminUser = await User.create({
        email: 'admin@thunderauto.com',
        password: await bcryptjs.hash('admin123', 10),
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      });
      console.log('New admin user created:', {
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role
      });
    }

  } catch (error) {
    console.error('Error creating/updating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser();
