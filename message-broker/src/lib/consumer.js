/**
 * Message Consumer
 * 
 * Provides functionality for consuming messages from queues.
 */

const amqp = require('amqplib');
const { rabbitmq: config } = require('../config');
const logger = require('../utils/logger');
const errorHandler = require('../utils/error-handler');

class Consumer {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.consumers = new Map();
  }

  async connect() {
    try {
      this.connection = await amqp.connect(config.connection);
      this.channel = await this.connection.createChannel();
      
      // Set up exchange
      await this.channel.assertExchange(
        config.exchanges.verification.name,
        config.exchanges.verification.type,
        config.exchanges.verification.options
      );

      logger.info('Connected to RabbitMQ');
    } catch (error) {
      logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
      throw error;
    }
  }

  async consume(queueName, callback) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      // Assert queue
      await this.channel.assertQueue(queueName, {
        durable: true
      });

      // Bind queue to exchange
      await this.channel.bindQueue(
        queueName,
        config.exchanges.verification.name,
        queueName
      );

      // Consume messages
      await this.channel.consume(queueName, async (msg) => {
        if (msg !== null) {
          try {
            const content = JSON.parse(msg.content.toString());
            await callback(content);
            this.channel.ack(msg);
          } catch (error) {
            logger.error(`Error processing message: ${error.message}`);
            // Reject message and requeue
            this.channel.nack(msg, false, true);
          }
        }
      });

      logger.info(`Started consuming from queue: ${queueName}`);
    } catch (error) {
      logger.error(`Failed to consume from queue ${queueName}: ${error.message}`);
      throw error;
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      logger.info('Closed RabbitMQ connection');
    } catch (error) {
      logger.error(`Error closing RabbitMQ connection: ${error.message}`);
      throw error;
    }
  }

  /**
   * Start consuming messages from a queue
   * 
   * @param {string} queueName - The queue to consume from
   * @param {Function} handler - The message handler function
   * @param {Object} options - Consumption options (optional)
   * @returns {Promise<Object>} - Promise resolving to consumer details
   */
  async subscribe(queueName, handler, options = {}) {
    try {
      // Check if broker is initialized
      if (!this.connection) {
        await this.connect();
      }
      
      // Merge default options with provided options
      const consumeOptions = {
        ...config.consumeDefaults,
        ...options
      };
      
      // Register the consumer
      const { consumerTag } = await this.channel.consume(
        queueName,
        async (msg) => {
          if (!msg) {
            logger.warn(`Consumer for ${queueName} was cancelled by server`);
            return;
          }
          
          try {
            // Parse message content
            const content = JSON.parse(msg.content.toString());
            
            // Log received message
            logger.debug(`Received message from ${queueName}`, {
              messageId: msg.properties.messageId,
              routingKey: msg.fields.routingKey
            });
            
            // Process the message with the handler
            await handler(content, msg);
            
            // Acknowledge the message if auto-ack is disabled
            if (!consumeOptions.noAck) {
              this.channel.ack(msg);
            }
          } catch (error) {
            // Handle errors during message processing
            errorHandler.handleConsumerError(this.channel, msg, error, queueName);
          }
        },
        consumeOptions
      );
      
      // Store consumer info
      this.consumers.set(consumerTag, {
        queueName,
        consumerTag,
        options: consumeOptions
      });
      
      logger.info(`Consumer started for queue: ${queueName} with tag: ${consumerTag}`);
      
      return {
        queueName,
        consumerTag
      };
    } catch (error) {
      logger.error(`Error subscribing to queue ${queueName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel a consumer
   * 
   * @param {string} consumerTag - The consumer tag to cancel
   * @returns {Promise<boolean>} - Promise resolving to boolean indicating success
   */
  async unsubscribe(consumerTag) {
    try {
      // Check if broker is initialized
      if (!this.connection) {
        throw new Error('Broker not initialized');
      }
      
      // Check if the consumer exists
      if (!this.consumers.has(consumerTag)) {
        logger.warn(`Consumer with tag ${consumerTag} not found`);
        return false;
      }
      
      // Cancel the consumer
      await this.channel.cancel(consumerTag);
      
      // Remove from tracking
      const consumer = this.consumers.get(consumerTag);
      this.consumers.delete(consumerTag);
      
      logger.info(`Consumer cancelled for queue: ${consumer.queueName} with tag: ${consumerTag}`);
      
      return true;
    } catch (error) {
      logger.error(`Error unsubscribing consumer ${consumerTag}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel all active consumers
   * 
   * @returns {Promise<void>}
   */
  async unsubscribeAll() {
    try {
      const promises = [];
      
      for (const consumerTag of this.consumers.keys()) {
        promises.push(this.unsubscribe(consumerTag));
      }
      
      await Promise.all(promises);
      logger.info('All consumers cancelled successfully');
    } catch (error) {
      logger.error(`Error cancelling all consumers: ${error.message}`);
      throw error;
    }
  }
}

module.exports = Consumer;