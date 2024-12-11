import amqp from 'amqplib'
import { logger } from '../utils/logger'

let channel: amqp.Channel | null = null

export async function setupMessageQueue(): Promise<{ connection: amqp.Connection, channel: amqp.Channel } | null> {
  try {
    // Use environment variable to control RabbitMQ connection
    const rabbitMQEnabled = process.env.RABBITMQ_ENABLED === 'true'
    
    if (!rabbitMQEnabled) {
      logger.warn('RabbitMQ is disabled. Skipping message queue setup.')
      return null
    }

    const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'
    
    const connection = await amqp.connect(RABBITMQ_URL)
    channel = await connection.createChannel()
    
    logger.info('🐰 Connected to RabbitMQ')
    
    // Define queues
    await channel.assertQueue('email-notifications', { durable: true })
    await channel.assertQueue('data-processing', { durable: true })
    
    // Optional: Define default exchange and queue
    await channel.assertExchange('thunderauto-exchange', 'direct', { durable: true })
    await channel.assertQueue('thunderauto-queue', { durable: true })

    // Setup consumers
    await setupConsumers(channel)
    
    return { connection, channel }
  } catch (error: unknown) {
    logger.error('Failed to setup message queue', {
      errorName: error instanceof Error ? error.name : 'Unknown Error',
      errorMessage: error instanceof Error ? error.message : 'No error message',
      errorStack: error instanceof Error ? error.stack : 'No stack trace',
      rabbitMQUrl: process.env.RABBITMQ_URL
    })
    
    // Don't throw error, just log it
    return null
  }
}

async function setupConsumers(channel: amqp.Channel): Promise<void> {
  // Email notifications consumer
  channel.consume('email-notifications', async (msg: amqp.ConsumeMessage | null) => {
    if (msg) {
      try {
        const data = JSON.parse(msg.content.toString())
        await processEmailNotification(data)
        channel.ack(msg)
      } catch (error: unknown) {
        logger.error('Error processing email notification:', error)
        channel.nack(msg)
      }
    }
  })

  // Data processing consumer
  channel.consume('data-processing', async (msg: amqp.ConsumeMessage | null) => {
    if (msg) {
      try {
        const data = JSON.parse(msg.content.toString())
        await processData(data)
        channel.ack(msg)
      } catch (error: unknown) {
        logger.error('Error processing data:', error)
        channel.nack(msg)
      }
    }
  })
}

async function processEmailNotification(data: unknown): Promise<void> {
  // Implement email sending logic here
  logger.info('Processing email notification:', data)
}

async function processData(data: unknown): Promise<void> {
  // Implement data processing logic here
  logger.info('Processing data:', data)
}

export async function publishToQueue(queueName: string, data: unknown): Promise<boolean> {
  try {
    if (!channel) {
      throw new Error('Message queue not initialized')
    }
    
    const message = Buffer.from(JSON.stringify(data))
    return channel.sendToQueue(queueName, message, {
      persistent: true
    })
  } catch (error: unknown) {
    logger.error('Error publishing to queue:', error)
    throw error
  }
}
