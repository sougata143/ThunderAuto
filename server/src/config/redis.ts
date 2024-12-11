import Redis from 'ioredis'
import { logger } from '../utils/logger'

let redisClient: Redis | null = null

export async function createRedisClient(): Promise<Redis> {
  if (redisClient) {
    return redisClient
  }

  const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

  try {
    redisClient = new Redis(REDIS_URL, {
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
    })

    redisClient.on('error', (error: Error) => {
      logger.error('Redis connection error:', error)
    })

    redisClient.on('connect', () => {
      logger.info('🔄 Connected to Redis')
    })

    return redisClient
  } catch (error: unknown) {
    logger.error('Failed to create Redis client:', error)
    throw error
  }
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}
