import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { IContext } from './types/context';
import { authMiddleware, AuthRequest } from './middleware/auth.middleware';
import { authDirectiveTransformer } from './graphql/directives/auth.directive';
import { makeExecutableSchema } from '@graphql-tools/schema';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Create Apollo Server
const server = new ApolloServer<IContext>({
  schema: authDirectiveTransformer(makeExecutableSchema({ typeDefs, resolvers })),
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thunderauto';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Start the server
async function startServer() {
  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    authMiddleware,
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authReq = req as AuthRequest;
        console.log('GraphQL Context Creation:', {
          hasAuthHeader: !!authReq.headers.authorization,
          hasUser: !!authReq.user,
          userDetails: authReq.user ? {
            id: authReq.user._id,
            role: authReq.user.role,
            email: authReq.user.email
          } : 'No User'
        });
        return {
          req: authReq,
          user: authReq.user
        };
      }
    })
  );

  const PORT = process.env.PORT || 4001;

  await new Promise<void>((resolve) => {
    httpServer.listen({ port: PORT }, resolve);
  });

  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

startServer().catch((error) => {
  console.error('Error starting server:', error);
});
