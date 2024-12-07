import amqp from 'amqplib'
import { logger } from '../utils/logger'

let channel: amqp.Channel | null = null

export async function setupMessageQueue() {
  if (channel) {
    return channel
  }

  const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost'

  try {
    const connection = await amqp.connect(RABBITMQ_URL)
    channel = await connection.createChannel()

    // Define queues
    await channel.assertQueue('car-updates', { durable: true })
    await channel.assertQueue('notifications', { durable: true })

    logger.info('🐰 Connected to RabbitMQ')
    return channel
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ:', error)
    throw error
  }
}

export async function closeMessageQueue() {
  if (channel) {
    await channel.close()
    channel = null
  }
}
