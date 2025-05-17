/**
 * Donation Service Producer
 * 
 * Specialized producer for donation-related messages.
 */

const amqp = require('amqplib');
const { rabbitmq: config } = require('../../config');
const logger = require('../../utils/logger');
const crypto = require('crypto');

class DonationProducer {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(config.connection);
      this.channel = await this.connection.createChannel();
      
      // Set up exchange
      await this.channel.assertExchange(
        config.exchanges.donation.name,
        'direct',
        { durable: true }
      );

      // Declare queues
      await this.channel.assertQueue('donation.created', { durable: true });
      await this.channel.assertQueue('donation.processed', { durable: true });

      // Bind queues to exchange
      await this.channel.bindQueue('donation.created', config.exchanges.donation.name, 'donation.created');
      await this.channel.bindQueue('donation.processed', config.exchanges.donation.name, 'donation.processed');

      logger.info('Donation producer connected to RabbitMQ');
    } catch (error) {
      logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
      throw error;
    }
  }

  async publishMessage(routingKey, message) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      // Ensure message has a unique ID if not provided
      if (!message.id) {
        message.id = message.transaction_id || crypto.randomUUID();
      }

      const messageBuffer = Buffer.from(JSON.stringify({
        id: message.id,
        timestamp: new Date().toISOString(),
        data: message
      }));
      
      // Publish to exchange with routing key
      await this.channel.publish(
        config.exchanges.donation.name,
        routingKey,
        messageBuffer,
        {
          persistent: true,
          contentType: 'application/json',
          messageId: message.id,
          headers: {
            'x-deduplication-id': message.id
          }
        }
      );

      logger.info(`Published message to ${routingKey} with ID: ${message.id}`);
    } catch (error) {
      logger.error(`Failed to publish message to ${routingKey}: ${error.message}`);
      throw error;
    }
  }

  async publishNewDonation(donation) {
    await this.publishMessage(
      'donation.created',
      {
        ...donation,
        timestamp: new Date().toISOString()
      }
    );
  }

  async publishDonationStatus(status) {
    await this.publishMessage(
      'donation.processed',
      {
        ...status,
        timestamp: new Date().toISOString()
      }
    );
  }

  async publishRefundRequest(refund) {
    await this.publishMessage(
      'donation.refund',
      {
        ...refund,
        timestamp: new Date().toISOString()
      }
    );
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
}

module.exports = new DonationProducer();