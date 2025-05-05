/**
 * Notification Service Producer (RabbitMQ)
 * 
 * Specialized producer for notification-related messages using RabbitMQ.
 */

const amqp = require('amqplib');
const { rabbitmq: config } = require('../../config');
const logger = require('../../utils/logger');

class NotificationProducer {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  /**
   * Connect to the RabbitMQ broker
   * 
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      this.connection = await amqp.connect(config.connection);
      this.channel = await this.connection.createChannel();
      
      // Set up exchange
      await this.channel.assertExchange(
        config.exchanges.notification.name,
        config.exchanges.notification.type,
        config.exchanges.notification.options
      );

      logger.info('Notification producer connected to RabbitMQ');
    } catch (error) {
      logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
      throw error;
    }
  }

  /**
   * Publish a message to a specific routing key
   * 
   * @param {string} routingKey - The routing key for the message
   * @param {Object} message - The message to be published
   * @returns {Promise<void>}
   */
  async publishMessage(routingKey, message) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      await this.channel.publish(
        config.exchanges.notification.name,
        routingKey,
        messageBuffer,
        {
          persistent: true,
          contentType: 'application/json'
        }
      );

      logger.info(`Published message to ${routingKey}`);
    } catch (error) {
      logger.error(`Failed to publish message to ${routingKey}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Publish an email notification
   * 
   * @param {Object} notification - The notification data
   * @returns {Promise<void>}
   */
  async publishEmailNotification(notification) {
    await this.publishMessage(
      config.queues.notification.email,
      {
        ...notification,
        timestamp: new Date().toISOString()
      }
    );
  }

  /**
   * Publish an SMS notification
   * 
   * @param {Object} notification - The notification data
   * @returns {Promise<void>}
   */
  async publishSMSNotification(notification) {
    await this.publishMessage(
      config.queues.notification.sms,
      {
        ...notification,
        timestamp: new Date().toISOString()
      }
    );
  }

  /**
   * Publish a push notification
   * 
   * @param {Object} notification - The notification data
   * @returns {Promise<void>}
   */
  async publishPushNotification(notification) {
    await this.publishMessage(
      config.queues.notification.push,
      {
        ...notification,
        timestamp: new Date().toISOString()
      }
    );
  }

  /**
   * Close the RabbitMQ connection
   * 
   * @returns {Promise<void>}
   */
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
}

// Export a singleton instance
module.exports = new NotificationProducer();