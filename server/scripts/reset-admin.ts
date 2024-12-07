import mongoose from 'mongoose'
import { User } from '../src/models/User'
import dotenv from 'dotenv'

dotenv.config()

const resetAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thunderauto')
    
    // Remove existing admin
    await User.deleteOne({ email: 'admin@thunderauto.com' })
    console.log('Removed existing admin if any')

    // Create new admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@thunderauto.com',
      password: 'Admin@123', // Will be hashed by the pre-save middleware
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
    console.log('Email: admin@thunderauto.com')
    console.log('Password: Admin@123')
  } catch (error) {
    console.error('Error resetting admin user:', error)
  } finally {
    await mongoose.disconnect()
  }
}

resetAdmin()
