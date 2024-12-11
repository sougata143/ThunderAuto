import winston from 'winston'
import path from 'path'
import fs from 'fs'

// Ensure log directory exists
const logDir = path.join(__dirname, '../../logs')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return stack 
        ? `${timestamp} [${level}]: ${message}\n${stack}` 
        : `${timestamp} [${level}]: ${message}`
    })
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // Detailed error log
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Combined log with all levels
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Separate debug log for development
    new winston.transports.File({ 
      filename: path.join(logDir, 'debug.log'), 
      level: 'debug',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
})

// Add global error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  console.error('Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// Helper function to log method calls
export function logMethodCall(className: string, methodName: string, args?: any) {
  logger.debug(`Method Call: ${className}.${methodName}`, {
    arguments: args ? JSON.stringify(args) : 'No arguments'
  })
}

// Helper function for detailed object logging
export function logObject(label: string, obj: any) {
  logger.debug(`Object Log: ${label}`, {
    objectDetails: JSON.stringify(obj, null, 2)
  })
}

// Add a method to log entire objects with more context
export function logObjectWithContext(label: string, obj: any, context?: any) {
  const formattedLog = {
    timestamp: new Date().toISOString(),
    label,
    object: obj,
    context: context || {}
  }
  
  logger.debug(JSON.stringify(formattedLog, null, 2))
}
