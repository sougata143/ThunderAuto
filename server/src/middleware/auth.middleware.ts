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
    logger.info('Full Auth Header:', authHeader);

    if (!authHeader) {
      logger.warn('No authorization header found');
      return next()
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      logger.warn('No token found in authorization header');
      return next()
    }

    logger.info('Attempting to verify token');
    const decoded = AuthService.verifyToken(token)
    logger.info('Decoded Token Details:', { 
      userId: decoded.userId, 
      exp: decoded.exp, 
      iat: decoded.iat 
    });

    const user = await User.findById(decoded.userId).select('+role')
    
    if (user) {
      logger.info('User Found Details:', { 
        id: user._id, 
        role: user.role, 
        email: user.email 
      });
      req.user = user
    } else {
      logger.warn('No user found for decoded token');
    }
    
    next()
  } catch (error) {
    logger.error('Auth middleware comprehensive error:', {
      errorName: error instanceof Error ? error.name : 'Unknown Error',
      errorMessage: error instanceof Error ? error.message : 'No error message',
      errorStack: error instanceof Error ? error.stack : 'No stack trace'
    });
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
