import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends mongoose.Document {
  name: string
  email: string
  password?: string
  role: 'guest' | 'user' | 'admin'
  isGuest: boolean
  lastLogin: Date
  preferences: {
    theme: 'light' | 'dark'
    notifications: boolean
    language: string
  }
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return !this.isGuest
    },
    minlength: 8,
  },
  role: {
    type: String,
    enum: ['guest', 'user', 'admin'],
    default: 'user',
  },
  isGuest: {
    type: Boolean,
    default: false,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      default: 'en',
    },
  },
}, {
  timestamps: true,
})

// Hash password before saving (only for non-guest users)
userSchema.pre('save', async function(next) {
  if (this.isModified('password') && !this.isGuest && this.password) {
    this.password = await bcrypt.hash(this.password, 10)
  }
  next()
})

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  if (this.isGuest) return false
  return this.password ? bcrypt.compare(candidatePassword, this.password) : false
}

export const User = mongoose.model<IUser>('User', userSchema)
