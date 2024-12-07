import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { User } from '../models/User'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thunderauto'

async function createAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    const adminPassword = 'admin123' // You should change this in production
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@thunderauto.com',
      password: hashedPassword,
      role: 'admin',
      isGuest: false,
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en'
      }
    })

    console.log('Admin user created successfully:', adminUser)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await mongoose.disconnect()
  }
}

createAdminUser()
