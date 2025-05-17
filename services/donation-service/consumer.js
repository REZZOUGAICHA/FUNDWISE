/**
 * Donation Service Consumer
 * 
 * Specialized consumer for donation-related messages.
 */

const Consumer = require('../../lib/consumer');
const { rabbitmq: config } = require('../../config');
const logger = require('../../utils/logger');
const donationService = require('../donation-service');
const amqp = require('amqplib');

class DonationConsumer extends Consumer {
  constructor() {
    super();
    this.initialized = false;
    this.processedMessages = new Set();
  }

  /**
   * Subscribe to donation created events
   * 
   * @param {Function} handler - The message handler function
   * @param {Object} options - Consumption options (optional)
   * @returns {Promise<Object>} - Consumer details
   */
  async subscribeToDonationCreated(handler, options = {}) {
    const queueName = config.queues.donationCreated.name;
    
    logger.info(`Setting up subscription to ${queueName}`);
    
    // Wrap the handler to add donation-specific processing if needed
    const wrappedHandler = async (message, originalMessage) => {
      logger.debug(`Processing donation created event: ${message.id}`);
      await handler(message, originalMessage);
    };
    
    return this.subscribe(queueName, wrappedHandler, options);
  }

  /**
   * Subscribe to donation processed events
   * 
   * @param {Function} handler - The message handler function
   * @param {Object} options - Consumption options (optional)
   * @returns {Promise<Object>} - Consumer details
   */
  async subscribeToDonationProcessed(handler, options = {}) {
    const queueName = config.queues.donationProcessed.name;
    
    logger.info(`Setting up subscription to ${queueName}`);
    
    // Wrap the handler to add donation-specific processing if needed
    const wrappedHandler = async (message, originalMessage) => {
      logger.debug(`Processing donation processed event: ${message.id}`);
      await handler(message, originalMessage);
    };
    
    return this.subscribe(queueName, wrappedHandler, options);
  }

  /**
   * Subscribe to blockchain confirmation events
   * 
   * @param {Function} handler - The message handler function
   * @param {Object} options - Consumption options (optional)
   * @returns {Promise<Object>} - Consumer details
   */
  async subscribeToBlockchainConfirmation(handler, options = {}) {
    const queueName = config.queues.blockchainConfirmation.name;
    
    logger.info(`Setting up subscription to ${queueName}`);
    
    // Wrap the handler to add donation-specific processing if needed
    const wrappedHandler = async (message, originalMessage) => {
      logger.debug(`Processing blockchain confirmation event: ${message.transactionHash}`);
      
      // Only process messages from donation transactions
      if (message.source === 'donation-service' || message.donationId) {
        await handler(message, originalMessage);
      }
    };
    
    return this.subscribe(queueName, wrappedHandler, options);
  }

  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Connect to RabbitMQ
      await this.connect();

      // Set up consumer for new donations
      await this.consumeNewDonation();
      
      // Set up consumer for donation status updates
      await this.consumeDonationStatus();
      
      // Set up consumer for refund requests
      await this.consumeRefundRequest();
      
      this.initialized = true;
      logger.info('Donation consumer initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize donation consumer: ${error.message}`);
      throw error;
    }
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
      await this.channel.assertQueue('donation.new', { durable: true });
      await this.channel.assertQueue('donation.status', { durable: true });
      await this.channel.assertQueue('donation.refund', { durable: true });

      // Bind queues to exchange
      await this.channel.bindQueue('donation.new', config.exchanges.donation.name, 'donation.new');
      await this.channel.bindQueue('donation.status', config.exchanges.donation.name, 'donation.status');
      await this.channel.bindQueue('donation.refund', config.exchanges.donation.name, 'donation.refund');

      logger.info('Donation consumer connected to RabbitMQ');
    } catch (error) {
      logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
      throw error;
    }
  }

  async consumeNewDonation() {
    const queue = 'donation.new';
    
    await this.channel.consume(queue, async (msg) => {
      if (msg === null) return;

      try {
        const message = JSON.parse(msg.content.toString());
        const messageData = message.data || message;
        const messageId = message.id || msg.properties.messageId;

        // Check if we've already processed this message
        if (await this.isMessageProcessed(messageId)) {
          logger.info(`Skipping already processed message: ${messageId}`);
          this.channel.ack(msg);
          return;
        }

        logger.info(`Processing new donation for campaign ID: ${messageData.campaignId}`);
        
        // Process the donation
        const donation = await donationService.processDonation({
          id: messageId,
          campaignId: messageData.campaignId,
          amount: messageData.amount,
          currency: messageData.currency,
          donorId: messageData.donorId,
          paymentMethod: messageData.paymentMethod,
          paymentDetails: messageData.paymentDetails,
          metadata: messageData.metadata
        });

        // Mark message as processed
        await this.markMessageAsProcessed(messageId);

        // Acknowledge the message
        this.channel.ack(msg);

        // Notify about successful donation
        const notificationProducer = require('../notification/producer');
        await notificationProducer.publishEmailNotification({
          type: 'email',
          recipient: messageData.donorId,
          subject: 'Thank you for your donation!',
          template: 'donation_receipt',
          data: {
            donationId: donation.id,
            amount: donation.amount,
            currency: donation.currency,
            campaignId: donation.campaignId
          }
        });

        logger.info(`Processed new donation ID: ${donation.id}`);
      } catch (error) {
        logger.error(`Error processing new donation: ${error.message}`);
        // Reject the message and requeue it
        this.channel.nack(msg, false, true);
      }
    });
  }

  async consumeDonationStatus() {
    const queue = config.queues.donation.status;
    
    await this.consume(queue, async (message) => {
      try {
        logger.info(`Processing donation status update for ID: ${message.donationId}`);
        
        // Update donation status
        await donationService.updateDonationStatus(
          message.donationId,
          message.status,
          message.transactionId
        );

        // Notify about status update
        const notificationProducer = require('../notification/producer');
        await notificationProducer.publishEmailNotification({
          type: 'email',
          recipient: message.donorId,
          subject: 'Donation Status Update',
          template: 'donation_status',
          data: {
            donationId: message.donationId,
            status: message.status,
            transactionId: message.transactionId
          }
        });

        logger.info(`Updated donation status for ID: ${message.donationId}`);
      } catch (error) {
        logger.error(`Error processing donation status: ${error.message}`);
        throw error;
      }
    });
  }

  async consumeRefundRequest() {
    const queue = config.queues.donation.refund;
    
    await this.consume(queue, async (message) => {
      try {
        logger.info(`Processing refund request for donation ID: ${message.donationId}`);
        
        // Process refund request
        const refund = await donationService.processRefund({
          donationId: message.donationId,
          reason: message.reason,
          requestedBy: message.requestedBy,
          amount: message.amount,
          currency: message.currency
        });

        // Notify about refund
        const notificationProducer = require('../notification/producer');
        await notificationProducer.publishEmailNotification({
          type: 'email',
          recipient: message.requestedBy,
          subject: 'Refund Processed',
          template: 'refund_confirmation',
          data: {
            donationId: message.donationId,
            amount: message.amount,
            currency: message.currency,
            refundId: refund.id
          }
        });

        logger.info(`Processed refund for donation ID: ${message.donationId}`);
      } catch (error) {
        logger.error(`Error processing refund request: ${error.message}`);
        throw error;
      }
    });
  }

  // Add message deduplication methods
  async isMessageProcessed(messageId) {
    // Implement your preferred deduplication storage (Redis, database, etc.)
    // For now, we'll use a simple in-memory cache
    return this.processedMessages.has(messageId);
  }

  async markMessageAsProcessed(messageId) {
    // Store the processed message ID
    this.processedMessages.add(messageId);
    
    // Optional: Implement cleanup of old message IDs
    setTimeout(() => {
      this.processedMessages.delete(messageId);
    }, 24 * 60 * 60 * 1000); // Clean up after 24 hours
  }
}

module.exports = DonationConsumer;