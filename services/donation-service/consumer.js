/**
 * Donation Service Consumer
 * 
 * Specialized consumer for donation-related messages.
 */

const Consumer = require('../../lib/consumer');
const { rabbitmq: config } = require('../../config');
const logger = require('../../utils/logger');
const donationService = require('../donation-service');

class DonationConsumer extends Consumer {
  constructor() {
    super();
    this.initialized = false;
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

  async consumeNewDonation() {
    const queue = config.queues.donation.new;
    
    await this.consume(queue, async (message) => {
      try {
        logger.info(`Processing new donation for campaign ID: ${message.campaignId}`);
        
        // Process the donation
        const donation = await donationService.processDonation({
          id: message.id,
          campaignId: message.campaignId,
          amount: message.amount,
          currency: message.currency,
          donorId: message.donorId,
          paymentMethod: message.paymentMethod,
          paymentDetails: message.paymentDetails,
          metadata: message.metadata
        });

        // Notify about successful donation
        const notificationProducer = require('../notification/producer');
        await notificationProducer.publishEmailNotification({
          type: 'email',
          recipient: message.donorId,
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
        throw error;
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
}

module.exports = DonationConsumer;