const amqp = require('amqplib');
const config = require('../config');
const logger = require('../src/utils/logger');

class MessageBrokerClient {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.connected = false;
    this.retryCount = 0;
    this.maxRetries = config.messageBroker.maxRetries || 5;
    this.retryInterval = config.messageBroker.retryInterval || 5000;
  }

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
    await this.channel.assertQueue('campaign.updated', { durable: true });
    await this.channel.assertQueue('campaign.status', { durable: true });
    
    // Bind queues to exchanges
    await this.channel.bindQueue(
      'campaign.updated', 
      config.messageBroker.exchanges.campaign, 
      'campaign.updated'
    );
    
    await this.channel.bindQueue(
      'campaign.status', 
      config.messageBroker.exchanges.campaign, 
      'campaign.status'
    );
  }

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

  handleConnectionError(error) {
    this.connected = false;
    logger.error(`Message broker connection error: ${error.message}`);
    this.attemptReconnect();
  }

  handleConnectionClose() {
    if (this.connected) {
      this.connected = false;
      logger.warn('Message broker connection closed unexpectedly');
      this.attemptReconnect();
    }
  }

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