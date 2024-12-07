import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User } from '../models/User'
import bcrypt from 'bcryptjs'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thunderauto'

async function registerAdmin() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // First check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@thunderauto.com' })
    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash('admin123', salt)

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@thunderauto.com',
      password: hashedPassword,
      role: 'ADMIN'
    })

    console.log('Admin user created successfully')
    console.log('Admin ID:', admin._id)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await mongoose.disconnect()
  }
}

registerAdmin()
