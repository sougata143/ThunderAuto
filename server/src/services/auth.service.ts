import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { User, IUser } from '../models/User'
import { logger } from '../utils/logger'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export class AuthService {
  static generateToken(user: IUser): string {
    return jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        isGuest: user.isGuest 
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

  static async registerUser(name: string, email: string, password: string): Promise<{ user: IUser; token: string }> {
    try {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        throw new Error('Email already registered')
      }

      const user = await User.create({
        name,
        email,
        password,
        role: 'user',
        isGuest: false,
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
        throw new Error('User not found')
      }

      if (user.isGuest) {
        throw new Error('Guest accounts cannot login with password')
      }

      const isValidPassword = await user.comparePassword(password)
      if (!isValidPassword) {
        throw new Error('Invalid password')
      }

      user.lastLogin = new Date()
      await user.save()

      const token = this.generateToken(user)
      return { user, token }
    } catch (error) {
      logger.error('Error logging in user:', error)
      throw error
    }
  }

  static async createGuestUser(): Promise<{ user: IUser; token: string }> {
    try {
      const guestEmail = `guest_${nanoid(10)}@thunderauto.com`
      const guestName = `Guest_${nanoid(6)}`

      const user = await User.create({
        name: guestName,
        email: guestEmail,
        role: 'guest',
        isGuest: true,
      })

      const token = this.generateToken(user)
      return { user, token }
    } catch (error) {
      logger.error('Error creating guest user:', error)
      throw error
    }
  }

  static async upgradeGuestUser(
    userId: string,
    name: string,
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string }> {
    try {
      const user = await User.findById(userId)
      if (!user) {
        throw new Error('User not found')
      }

      if (!user.isGuest) {
        throw new Error('Only guest accounts can be upgraded')
      }

      const existingUser = await User.findOne({ email })
      if (existingUser) {
        throw new Error('Email already registered')
      }

      user.name = name
      user.email = email
      user.password = password
      user.role = 'user'
      user.isGuest = false

      await user.save()

      const token = this.generateToken(user)
      return { user, token }
    } catch (error) {
      logger.error('Error upgrading guest user:', error)
      throw error
    }
  }
}
