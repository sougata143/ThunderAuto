import mongoose, { Document, Schema, Types } from 'mongoose'
import bcrypt from 'bcryptjs'
import { logger } from '../utils/logger'

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'GUEST' | 'USER' | 'ADMIN';
  preferences: {
    theme: string;
    notifications: boolean;
    language: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['GUEST', 'USER', 'ADMIN'],
    default: 'USER'
  },
  preferences: {
    theme: {
      type: String,
      default: 'light'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en'
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const startTime = Date.now()
  const isMatch = await bcrypt.compare(candidatePassword, this.password)
  const duration = Date.now() - startTime

  logger.info('Password comparison result', {
    userId: this._id,
    email: this.email,
    isMatch,
    comparisonDurationMs: duration
  })

  return isMatch
};

export const User = mongoose.model<IUser>('User', userSchema);
