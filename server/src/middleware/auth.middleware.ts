import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'
import { User } from '../models/User'
import { logger } from '../utils/logger'

export interface AuthRequest extends Request {
  user?: any
}

export const authMiddleware = async (req: AuthRequest, _: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return next()
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return next()
    }

    const decoded = AuthService.verifyToken(token)
    const user = await User.findById(decoded.userId)
    
    if (user) {
      req.user = user
    }
    
    next()
  } catch (error) {
    logger.error('Auth middleware error:', error)
    next()
  }
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  next()
}

export const requireNonGuest = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.isGuest) {
    return res.status(403).json({ error: 'Full account required for this action' })
  }
  next()
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}
