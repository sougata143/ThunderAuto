import Redis from 'ioredis'
import { logger } from '../utils/logger'

let redisClient: Redis | null = null

export async function createRedisClient() {
  if (redisClient) {
    return redisClient
  }

  const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

  try {
    redisClient = new Redis(REDIS_URL, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
    })

    redisClient.on('error', (error) => {
      logger.error('Redis connection error:', error)
    })

    redisClient.on('connect', () => {
      logger.info('🔄 Connected to Redis')
    })

    return redisClient
  } catch (error) {
    logger.error('Failed to create Redis client:', error)
    throw error
  }
}

export async function closeRedisConnection() {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}
