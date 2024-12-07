import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User } from '../models/User'
import bcrypt from 'bcryptjs'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thunderauto'

async function updateAdminPassword() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    const admin = await User.findOne({ email: 'admin@thunderauto.com' })
    if (!admin) {
      console.log('Admin user not found')
      return
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash('admin123', salt)

    // Update admin password and preferences
    admin.password = hashedPassword
    admin.preferences = {
      theme: 'LIGHT',
      notifications: true,
      language: 'en'
    }
    await admin.save()

    console.log('Admin password updated successfully')
  } catch (error) {
    console.error('Error updating admin password:', error)
  } finally {
    await mongoose.disconnect()
  }
}

updateAdminPassword()
