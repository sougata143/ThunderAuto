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

async function startServer() {
  const app = express()
  
  // Connect to MongoDB
  await connectDB()
  
  // Initialize Redis
  await createRedisClient()
  
  // Setup RabbitMQ
  await setupMessageQueue()
  
  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })
  
  // Start Apollo Server
  await server.start()
  
  // Middleware
  app.use(cors())
  app.use(express.json())
  app.use('/graphql', expressMiddleware(server))
  
  // Start Express Server
  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`)
    logger.info(`🎯 GraphQL endpoint: http://localhost:${PORT}/graphql`)
  })
}

startServer().catch((error) => {
  logger.error('Failed to start server:', error)
  process.exit(1)
})
