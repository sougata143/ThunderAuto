import express from 'express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import http from 'http'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import typeDefs from './graphql/typeDefs'
import { resolvers } from './graphql/resolvers'
import { IContext } from './types/context'

dotenv.config()

const app = express()
const httpServer = http.createServer(app)

// Create Apollo Server
const server = new ApolloServer<IContext>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
})

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thunderauto'

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error)
  })

// Start the server
async function startServer() {
  await server.start()

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Add authentication logic here
        return {
          req,
          user: null // Replace with actual user from auth
        }
      }
    })
  )

  const PORT = process.env.PORT || 4000

  await new Promise<void>((resolve) => {
    httpServer.listen({ port: PORT }, resolve)
  })

  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`)
}

startServer().catch((error) => {
  console.error('Error starting server:', error)
})
