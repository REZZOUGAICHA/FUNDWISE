/**
 * Error Handler
 * 
 * Centralized error handling for the message broker.
 */

const logger = require('./logger');

class ErrorHandler {
  /**
   * Handle errors in message consumption
   * 
   * @param {Object} channel - RabbitMQ channel
   * @param {Object} msg - Message object
   * @param {Error} error - Error that occurred
   * @param {string} queueName - Name of the queue being processed
   */
  static handleConsumerError(channel, msg, error, queueName) {
    logger.error(`Error processing message from ${queueName}: ${error.message}`);
    
    // Log additional error details
    logger.error('Error details:', {
      queue: queueName,
      messageId: msg.properties.messageId,
      error: error.stack
    });

    // Reject message and requeue
    channel.nack(msg, false, true);
  }

  /**
   * Handle errors in message production
   * 
   * @param {Error} error - Error that occurred
   * @param {string} routingKey - Routing key for the message
   */
  static handleProducerError(error, routingKey) {
    logger.error(`Error publishing message to ${routingKey}: ${error.message}`);
    logger.error('Error details:', {
      routingKey,
      error: error.stack
    });
  }
}

module.exports = ErrorHandler;