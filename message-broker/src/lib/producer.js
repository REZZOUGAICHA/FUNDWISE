/**
 * Message Producer
 * 
 * Provides functionality for publishing messages to exchanges.
 */

const broker = require('./broker');
const { rabbitmq: config } = require('../config');
const logger = require('../utils/logger');

class Producer {
  /**
   * Publish a message to an exchange with the specified routing key
   * 
   * @param {string} exchange - The exchange to publish to
   * @param {string} routingKey - The routing key for the message
   * @param {Object} message - The message payload to send
   * @param {Object} options - Publishing options (optional)
   * @returns {Promise<boolean>} - Promise resolving to boolean indicating success
   */
  async publish(exchange, routingKey, message, options = {}) {
    try {
      // Check if broker is initialized
      if (!broker.initialized) {
        await broker.init();
      }
      
      const channel = broker.getChannel();
      
      // Prepare message content
      const content = Buffer.from(JSON.stringify(message));
      
      // Merge default options with provided options
      const publishOptions = {
        ...config.publishDefaults,
        ...options,
        contentType: 'application/json',
        timestamp: Date.now(),
        messageId: options.messageId || this.generateMessageId()
      };
      
      // Add more information if needed
      if (options.correlationId) {
        publishOptions.correlationId = options.correlationId;
      }
      
      // Publish the message
      const published = channel.publish(exchange, routingKey, content, publishOptions);
      
      if (published) {
        logger.debug(`Successfully published message to ${exchange} with routing key ${routingKey}`, {
          messageId: publishOptions.messageId,
          routingKey
        });
      } else {
        logger.warn(`Failed to publish message to ${exchange} with routing key ${routingKey}`, {
          messageId: publishOptions.messageId,
          routingKey
        });
      }
      
      return published;
    } catch (error) {
      logger.error(`Error publishing message to ${exchange} with routing key ${routingKey}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate a unique message ID
   * 
   * @returns {string} - Unique message ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

module.exports = Producer;