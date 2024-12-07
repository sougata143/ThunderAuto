import amqp from 'amqplib'
import { logger } from '../utils/logger'

let channel: amqp.Channel | null = null

export async function setupMessageQueue() {
  try {
    const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'
    
    const connection = await amqp.connect(RABBITMQ_URL)
    channel = await connection.createChannel()
    
    // Define queues
    await channel.assertQueue('email-notifications', { durable: true })
    await channel.assertQueue('data-processing', { durable: true })
    
    logger.info('🐰 Connected to RabbitMQ')
    
    // Setup consumers
    await setupConsumers(channel)
    
    return channel
  } catch (error) {
    logger.error('Failed to setup message queue:', error)
    throw error
  }
}

async function setupConsumers(channel: amqp.Channel) {
  // Email notifications consumer
  channel.consume('email-notifications', async (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg.content.toString())
        await processEmailNotification(data)
        channel.ack(msg)
      } catch (error) {
        logger.error('Error processing email notification:', error)
        channel.nack(msg)
      }
    }
  })

  // Data processing consumer
  channel.consume('data-processing', async (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg.content.toString())
        await processData(data)
        channel.ack(msg)
      } catch (error) {
        logger.error('Error processing data:', error)
        channel.nack(msg)
      }
    }
  })
}

async function processEmailNotification(data: any) {
  // Implement email sending logic here
  logger.info('Processing email notification:', data)
}

async function processData(data: any) {
  // Implement data processing logic here
  logger.info('Processing data:', data)
}

export async function publishToQueue(queueName: string, data: any) {
  try {
    if (!channel) {
      throw new Error('Message queue not initialized')
    }
    
    const message = Buffer.from(JSON.stringify(data))
    return channel.sendToQueue(queueName, message, {
      persistent: true
    })
  } catch (error) {
    logger.error('Error publishing to queue:', error)
    throw error
  }
}
