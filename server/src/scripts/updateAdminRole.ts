import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User } from '../models/User'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thunderauto'

async function updateAdminRole() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    const admin = await User.findOne({ email: 'admin@thunderauto.com' })
    if (!admin) {
      console.log('Admin user not found')
      return
    }

    admin.role = 'ADMIN'
    await admin.save()

    console.log('Admin role updated successfully')
  } catch (error) {
    console.error('Error updating admin role:', error)
  } finally {
    await mongoose.disconnect()
  }
}

updateAdminRole()
