const broker = require('./broker');
const { rabbitmq: config } = require('../config');
const logger = require('../utils/logger');

class Producer {
  /**
   * Publish a message to an exchange with the specified routing key
   */
  async publish(exchange, routingKey, message, options = {}) {
    try {
      if (!broker.initialized) {
        await broker.init();
      }

      // Optional: validate exchange
      if (!config.exchanges || !config.exchanges[exchange]) {
        throw new Error(`Exchange "${exchange}" is not defined in RabbitMQ config`);
      }

      const channel = broker.getChannel();
      const content = Buffer.from(JSON.stringify(message));

      const publishOptions = {
        ...config.publishDefaults,
        ...options,
        contentType: 'application/json',
        timestamp: Date.now(),
        messageId: options.messageId || this.generateMessageId(),
      };

      if (options.correlationId) {
        publishOptions.correlationId = options.correlationId;
      }

      const published = channel.publish(exchange, routingKey, content, publishOptions);

      if (published) {
        logger.debug(`Published to ${exchange} with routing key ${routingKey}`, {
          messageId: publishOptions.messageId
        });
      } else {
        logger.warn(`Failed to publish message to ${exchange} with routing key ${routingKey}`, {
          messageId: publishOptions.messageId
        });
      }

      return published;
    } catch (error) {
      logger.error(`Publish error to ${exchange} (${routingKey}): ${error.message}`);
      throw error;
    }
  }

  /**
   * Retry publish helper (optional enhancement)
   */
  async retryPublish(exchange, routingKey, message, options = {}, retries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.publish(exchange, routingKey, message, options);
      } catch (err) {
        if (attempt === retries) throw err;
        logger.warn(`Retrying publish (attempt ${attempt}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Generate a unique message ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

module.exports = Producer;
