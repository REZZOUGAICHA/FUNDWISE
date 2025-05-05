/**
 * Donation Service Producer
 * 
 * Specialized producer for donation-related messages.
 */

const amqp = require('amqplib');
const { rabbitmq: config } = require('../../config');
const logger = require('../../utils/logger');

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
        config.exchanges.donation.type,
        config.exchanges.donation.options
      );

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

      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      await this.channel.publish(
        config.exchanges.donation.name,
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

  async publishNewDonation(donation) {
    await this.publishMessage(
      config.queues.donation.new,
      {
        ...donation,
        timestamp: new Date().toISOString()
      }
    );
  }

  async publishDonationStatus(status) {
    await this.publishMessage(
      config.queues.donation.status,
      {
        ...status,
        timestamp: new Date().toISOString()
      }
    );
  }

  async publishRefundRequest(refund) {
    await this.publishMessage(
      config.queues.donation.refund,
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