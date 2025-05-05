/**
 * Message Broker Client for Campaign Service
 * 
 * This client provides an interface for the Campaign Service
 * to interact with the message broker.
 */

const amqp = require('amqplib');
const config = require('../config');
const logger = require('../utils/logger');

class MessageBrokerClient {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.connected = false;
    this.retryCount = 0;
    this.maxRetries = config.messageBroker.maxRetries || 5;
    this.retryInterval = config.messageBroker.retryInterval || 5000;
  }

  /**
   * Connect to the message broker
   */
  async connect() {
    try {
      // Connect to the RabbitMQ server
      this.connection = await amqp.connect(config.messageBroker.url);
      this.channel = await this.connection.createChannel();
      
      // Handle connection events
      this.connection.on('error', this.handleConnectionError.bind(this));
      this.connection.on('close', this.handleConnectionClose.bind(this));
      
      // Set up exchanges and queues
      await this.setupExchangesAndQueues();
      
      this.connected = true;
      this.retryCount = 0;
      logger.info('Successfully connected to the message broker');
    } catch (error) {
      this.handleConnectionError(error);
    }
  }

  /**
   * Set up required exchanges and queues for the Campaign Service
   */
  async setupExchangesAndQueues() {
    // Set up exchanges
    await this.channel.assertExchange(
      config.messageBroker.exchanges.campaign, 
      'topic', 
      { durable: true }
    );
    
    await this.channel.assertExchange(
      config.messageBroker.exchanges.donation, 
      'topic', 
      { durable: true }
    );
    
    await this.channel.assertExchange(
      config.messageBroker.exchanges.verification, 
      'topic', 
      { durable: true }
    );
    
    // Set up campaign queues
    await this.channel.assertQueue('campaign.created', { durable: true });
    await this.channel.assertQueue('campaign.updated', { durable: true });
    await this.channel.assertQueue('campaign.closed', { durable: true });
    await this.channel.assertQueue('campaign.goal.reached', { durable: true });
    
    // Set up donation queues that campaign service needs to consume
    await this.channel.assertQueue('donation.created', { durable: true });
    await this.channel.assertQueue('donation.processed', { durable: true });
    
    // Set up verification queues that campaign service needs to consume
    await this.channel.assertQueue('verification.approved', { durable: true });
    await this.channel.assertQueue('verification.rejected', { durable: true });
    
    // Bind queues to exchanges
    await this.channel.bindQueue(
      'campaign.created', 
      config.messageBroker.exchanges.campaign, 
      'campaign.created'
    );
    
    await this.channel.bindQueue(
      'campaign.updated', 
      config.messageBroker.exchanges.campaign, 
      'campaign.updated'
    );
    
    await this.channel.bindQueue(
      'campaign.closed', 
      config.messageBroker.exchanges.campaign, 
      'campaign.closed'
    );
    
    await this.channel.bindQueue(
      'campaign.goal.reached', 
      config.messageBroker.exchanges.campaign, 
      'campaign.goal.reached'
    );
    
    await this.channel.bindQueue(
      'donation.created', 
      config.messageBroker.exchanges.donation, 
      'donation.created'
    );
    
    await this.channel.bindQueue(
      'donation.processed', 
      config.messageBroker.exchanges.donation, 
      'donation.processed'
    );
    
    await this.channel.bindQueue(
      'verification.approved', 
      config.messageBroker.exchanges.verification, 
      'verification.approved'
    );
    
    await this.channel.bindQueue(
      'verification.rejected', 
      config.messageBroker.exchanges.verification, 
      'verification.rejected'
    );
  }

  /**
   * Publish a message to the broker
   * 
   * @param {string} exchange - The exchange to publish to
   * @param {string} routingKey - The routing key for the message
   * @param {Object} message - The message to publish
   * @param {Object} options - Publishing options
   * @returns {Promise<boolean>} - Success status
   */
  async publish(exchange, routingKey, message, options = {}) {
    if (!this.connected) {
      await this.connect();
    }
    
    try {
      const defaultOptions = { persistent: true };
      const publishOptions = { ...defaultOptions, ...options };
      
      const success = this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        publishOptions
      );
      
      if (success) {
        logger.info(`Published message to ${exchange} exchange with routing key ${routingKey}`);
        return true;
      } else {
        logger.error(`Failed to publish message to ${exchange} exchange`);
        return false;
      }
    } catch (error) {
      logger.error(`Error publishing message: ${error.message}`);
      throw error;
    }
  }

  /**
   * Consume messages from a queue
   * 
   * @param {string} queue - The queue to consume from
   * @param {Function} callback - The function to call when a message is received
   * @param {Object} options - Consumption options
   * @returns {Promise<Object>} - Consumer tag
   */
  async consume(queue, callback, options = {}) {
    if (!this.connected) {
      await this.connect();
    }
    
    try {
      const defaultOptions = { noAck: false };
      const consumeOptions = { ...defaultOptions, ...options };
      
      const { consumerTag } = await this.channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            await callback(content);
            this.channel.ack(msg);
          } catch (error) {
            logger.error(`Error processing message from ${queue}: ${error.message}`);
            
            if (options.requeue !== false) {
              // Negative acknowledgment, message will be requeued
              this.channel.nack(msg);
            } else {
              // Reject the message but don't requeue
              this.channel.reject(msg, false);
            }
          }
        }
      }, consumeOptions);
      
      logger.info(`Started consuming from ${queue} queue`);
      return { consumerTag };
    } catch (error) {
      logger.error(`Error consuming from ${queue} queue: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle connection errors
   * 
   * @param {Error} error - The connection error
   */
  handleConnectionError(error) {
    this.connected = false;
    logger.error(`Message broker connection error: ${error.message}`);
    this.attemptReconnect();
  }

  /**
   * Handle connection closure
   */
  handleConnectionClose() {
    if (this.connected) {
      this.connected = false;
      logger.warn('Message broker connection closed unexpectedly');
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect to the message broker
   */
  async attemptReconnect() {
    if (this.retryCount >= this.maxRetries) {
      logger.error(`Failed to reconnect to message broker after ${this.maxRetries} attempts`);
      return;
    }
    
    this.retryCount++;
    logger.info(`Attempting to reconnect to message broker (attempt ${this.retryCount})`);
    
    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        logger.error(`Reconnection attempt failed: ${error.message}`);
      }
    }, this.retryInterval);
  }

  /**
   * Close the connection to the message broker
   */
  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.connected = false;
    logger.info('Message broker connection closed');
  }
}

// Export a singleton instance
module.exports = new MessageBrokerClient();