import jwt from 'jsonwebtoken'
import { User, IUser } from '../models/User'
import { logger } from '../utils/logger'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export class AuthService {
  static generateToken(user: IUser): string {
    return jwt.sign(
      { 
        userId: user._id,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  static async registerUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string }> {
    try {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        throw new Error('Email already registered')
      }

      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        role: 'USER'
      })

      const token = this.generateToken(user)
      return { user, token }
    } catch (error) {
      logger.error('Error registering user:', error)
      throw error
    }
  }

  static async loginUser(email: string, password: string): Promise<{ user: IUser; token: string }> {
    try {
      const user = await User.findOne({ email })
      if (!user) {
        throw new Error('Invalid email or password')
      }

      const isValid = await user.comparePassword(password)
      if (!isValid) {
        throw new Error('Invalid email or password')
      }

      const token = this.generateToken(user)
      return { user, token }
    } catch (error) {
      logger.error('Error logging in user:', error)
      throw error
    }
  }
}
