/**
 * RabbitMQ Message Broker Core
 * 
 * Main module that handles the connection and channel setup to RabbitMQ.
 * Manages connection, channel lifecycle, and recovery mechanisms.
 */

const amqp = require('amqplib');
const { rabbitmq: config } = require('../config');
const logger = require('../utils/logger');

class MessageBroker {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 20;
    this.reconnectTimeout = 5000; // 5 seconds
    this.initialized = false;
  }

  /**
   * Initialize the connection to RabbitMQ and setup the channel
   */
  async init() {
    try {
      if (this.initialized) {
        return;
      }

      await this.connect();
      await this.setupChannel();
      await this.setupExchanges();
      await this.setupQueues();
      
      this.initialized = true;
      this.reconnectAttempts = 0;
      logger.info('RabbitMQ broker initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize RabbitMQ broker: ${error.message}`);
      this.handleReconnect();
      throw error;
    }
  }

  /**
   * Connect to RabbitMQ server
   */
  async connect() {
    try {
      const { protocol, hostname, port, username, password, vhost } = config.connection;
      const connectionUrl = `${protocol}://${username}:${password}@${hostname}:${port}${vhost}`;
      
      logger.info(`Connecting to RabbitMQ at ${hostname}:${port}${vhost}`);
      this.connection = await amqp.connect(connectionUrl);
      
      // Setup event listeners
      this.connection.on('error', (err) => {
        logger.error(`RabbitMQ connection error: ${err.message}`);
        this.handleReconnect();
      });
      
      this.connection.on('close', () => {
        logger.info('RabbitMQ connection closed');
        this.handleReconnect();
      });
      
      logger.info('Successfully connected to RabbitMQ');
    } catch (error) {
      logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
      throw error;
    }
  }

  /**
   * Setup channel for communication
   */
  async setupChannel() {
    try {
      if (!this.connection) {
        throw new Error('No RabbitMQ connection available');
      }
      
      this.channel = await this.connection.createChannel();
      
      // Setup event listeners
      this.channel.on('error', (err) => {
        logger.error(`RabbitMQ channel error: ${err.message}`);
      });
      
      this.channel.on('close', () => {
        logger.info('RabbitMQ channel closed');
      });
      
      // Configure channel prefetch (concurrency control)
      await this.channel.prefetch(10); // Process up to 10 messages concurrently
      
      logger.info('RabbitMQ channel created successfully');
    } catch (error) {
      logger.error(`Failed to create RabbitMQ channel: ${error.message}`);
      throw error;
    }
  }

  /**
   * Setup all configured exchanges
   */
  async setupExchanges() {
    try {
      if (!this.channel) {
        throw new Error('No RabbitMQ channel available');
      }
      
      const { exchanges } = config;
      
      // Create each exchange defined in configuration
      for (const [key, exchange] of Object.entries(exchanges)) {
        logger.info(`Setting up exchange: ${exchange.name}`);
        await this.channel.assertExchange(
          exchange.name,
          exchange.type,
          exchange.options
        );
      }
      
      logger.info('All exchanges created successfully');
    } catch (error) {
      logger.error(`Failed to setup exchanges: ${error.message}`);
      throw error;
    }
  }

  /**
   * Setup all configured queues and bindings
   */
  async setupQueues() {
    try {
      if (!this.channel) {
        throw new Error('No RabbitMQ channel available');
      }
      
      const { queues } = config;
      
      // Create each queue defined in configuration and bind to its exchange
      for (const [key, queue] of Object.entries(queues)) {
        logger.info(`Setting up queue: ${queue.name}`);
        
        // Assert the queue
        await this.channel.assertQueue(queue.name, queue.options);
        
        // Bind the queue to its exchange with the binding key
        await this.channel.bindQueue(
          queue.name,
          queue.exchange,
          queue.bindingKey
        );
      }
      
      logger.info('All queues and bindings created successfully');
    } catch (error) {
      logger.error(`Failed to setup queues: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle reconnection strategy
   */
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Maximum reconnection attempts reached, giving up');
      process.exit(1);
      return;
    }
    
    this.reconnectAttempts++;
    this.initialized = false;
    
    setTimeout(async () => {
      logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      try {
        await this.init();
      } catch (error) {
        logger.error(`Reconnection attempt failed: ${error.message}`);
      }
    }, this.reconnectTimeout);
  }

  /**
   * Clean shutdown of connection and channel
   */
  async close() {
    try {
      if (this.channel) {
        logger.info('Closing RabbitMQ channel');
        await this.channel.close();
      }
      
      if (this.connection) {
        logger.info('Closing RabbitMQ connection');
        await this.connection.close();
      }
      
      this.initialized = false;
      logger.info('RabbitMQ broker closed successfully');
    } catch (error) {
      logger.error(`Error closing RabbitMQ connection: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the channel instance
   */
  getChannel() {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    return this.channel;
  }
}

// Create a singleton instance
const messageBroker = new MessageBroker();

module.exports = messageBroker;