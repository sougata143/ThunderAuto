import express from 'express'
import cors from 'cors'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { connectDB } from './config/database'
import { typeDefs } from './graphql/schema'
import { resolvers } from './graphql/resolvers'
import { createRedisClient } from './config/redis'
import { setupMessageQueue } from './config/messageQueue'
import { logger } from './utils/logger'
import { authMiddleware, AuthRequest } from './middleware/auth.middleware'
import { IContext } from './types/context'

async function startServer() {
  const app = express()
  
  try {
    // Connect to MongoDB with retry mechanism
    await connectDB()
    
    // Initialize Redis
    await createRedisClient()
    
    // Setup RabbitMQ
    const messageQueueResult = await setupMessageQueue()
    if (messageQueueResult) {
      logger.info('Message Queue setup completed successfully')
    } else {
      logger.warn('Message Queue setup skipped or failed')
    }
    
    // Create Apollo Server with explicit context type
    const server = new ApolloServer<IContext>({
      typeDefs,
      resolvers,
    })
    
    // Start Apollo Server
    await server.start()
    
    // Middleware
    app.use(cors())
    app.use(express.json())
    app.use(authMiddleware)
    
    // GraphQL endpoint with context
    app.use('/graphql', expressMiddleware(server, {
      context: async ({ req }: { req: AuthRequest }): Promise<IContext> => ({
        req: req as any,
        user: req.user || null
      })
    }))
    
    // Start Express Server
    const PORT = process.env.PORT || 4001
    const expressServer = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`)
      logger.info(`🎯 GraphQL endpoint: http://localhost:${PORT}/graphql`)
      
      // Additional logging for debugging
      logger.info('Server Configuration Details', {
        mongoUri: process.env.MONGODB_URI,
        logLevel: process.env.LOG_LEVEL,
        nodeEnv: process.env.NODE_ENV
      })
    })
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully');
      expressServer.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', {
      errorName: error instanceof Error ? error.name : 'Unknown Error',
      errorMessage: error instanceof Error ? error.message : 'No error message',
      errorStack: error instanceof Error ? error.stack : 'No stack trace'
    });
    process.exit(1);
  }
}

startServer();
