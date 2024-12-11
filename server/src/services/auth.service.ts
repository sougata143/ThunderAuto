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
      logger.info('Login attempt', { 
        email, 
        timestamp: new Date().toISOString() 
      })
      
      // Comprehensive logging for user search
      const userSearchResult = await User.findOne({ email })
      logger.info('User search result', { 
        email, 
        userFound: !!userSearchResult,
        userDetails: userSearchResult ? {
          id: userSearchResult._id,
          role: userSearchResult.role,
          email: userSearchResult.email
        } : null
      })

      if (!userSearchResult) {
        logger.warn('Login failed: User not found', { 
          email,
          timestamp: new Date().toISOString() 
        })
        throw new Error('Invalid email or password')
      }

      // Comprehensive password validation logging
      const passwordValidationStart = Date.now()
      const isValid = await userSearchResult.comparePassword(password)
      const passwordValidationDuration = Date.now() - passwordValidationStart

      logger.info('Password validation result', {
        email,
        isValidPassword: isValid,
        validationDurationMs: passwordValidationDuration
      })

      if (!isValid) {
        logger.warn('Login failed: Invalid password', { 
          email,
          timestamp: new Date().toISOString() 
        })
        throw new Error('Invalid email or password')
      }

      // Token generation with comprehensive logging
      const token = this.generateToken(userSearchResult)
      logger.info('Login successful', { 
        userId: userSearchResult._id, 
        email: userSearchResult.email,
        role: userSearchResult.role,
        timestamp: new Date().toISOString()
      })
      
      return { 
        user: userSearchResult, 
        token 
      }
    } catch (error) {
      logger.error('Comprehensive login error', { 
        email, 
        errorType: error instanceof Error ? error.name : 'Unknown Error',
        errorMessage: error instanceof Error ? error.message : 'No error message',
        errorStack: error instanceof Error ? error.stack : 'No stack trace',
        timestamp: new Date().toISOString()
      })
      throw error
    }
  }
}
