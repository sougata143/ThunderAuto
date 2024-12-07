import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { User } from '../src/models/User'
import dotenv from 'dotenv'

dotenv.config()

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thunderauto')
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@thunderauto.com' })
    if (existingAdmin) {
      console.log('Admin user already exists')
      process.exit(0)
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123!@#', 10)
    const admin = new User({
      name: 'Admin User',
      email: 'admin@thunderauto.com',
      password: hashedPassword,
      role: 'admin',
      isGuest: false,
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'en'
      }
    })

    await admin.save()
    console.log('Admin user created successfully')
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await mongoose.disconnect()
  }
}

createAdmin()
