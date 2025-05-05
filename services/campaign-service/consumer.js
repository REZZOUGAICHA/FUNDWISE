/**
 * Campaign Service Consumer
 * 
 * Specialized consumer for campaign-related messages.
 */

const Consumer = require('../../lib/consumer');
const { rabbitmq: config } = require('../../config');
const logger = require('../../utils/logger');
const errorHandler = require('../../utils/error-handler');
const campaignService = require('../campaign-service'); // This would be your actual campaign service implementation

class CampaignConsumer extends Consumer {
  /**
   * Initialize the campaign consumer with appropriate queues
   */
  async initialize() {
    try {
      // Set up consumers for donation-related events
      await this.consumeDonationCreated();
      await this.consumeDonationProcessed();
      
      // Set up consumers for verification-related events
      await this.consumeVerificationApproved();
      await this.consumeVerificationRejected();
      
      logger.info('Campaign consumer initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize campaign consumer: ${error.message}`);
      throw error;
    }
  }

  /**
   * Consume donation.created events to update campaign funding
   */
  async consumeDonationCreated() {
    const queue = config.queues.donation.created;
    
    await this.consume(queue, async (message) => {
      try {
        logger.info(`Processing donation.created event for campaign ID: ${message.campaignId}`);
        
        // Update campaign funding status (temporarily until donation is processed)
        await campaignService.updatePendingFunding(message.campaignId, message.amount);
        
        logger.info(`Updated pending funding for campaign ID: ${message.campaignId}`);
      } catch (error) {
        errorHandler.handleConsumerError(error, message, queue);
      }
    });
    
    logger.info(`Subscribed to ${queue} queue`);
  }

  /**
   * Consume donation.processed events to finalize campaign funding
   */
  async consumeDonationProcessed() {
    const queue = config.queues.donation.processed;
    
    await this.consume(queue, async (message) => {
      try {
        logger.info(`Processing donation.processed event for campaign ID: ${message.campaignId}`);
        
        // Update campaign with confirmed donation
        const updatedCampaign = await campaignService.updateFunding(
          message.campaignId, 
          message.amount, 
          message.donorId
        );
        
        // Check if campaign goal has been reached
        if (updatedCampaign.currentAmount >= updatedCampaign.goalAmount && 
            !updatedCampaign.goalReached) {
          
          // Mark campaign goal as reached
          await campaignService.markGoalReached(updatedCampaign.id);
          
          // Get full campaign data
          const campaign = await campaignService.getCampaignById(updatedCampaign.id);
          
          // Publish campaign goal reached event
          const campaignProducer = require('./producer');
          await campaignProducer.publishCampaignGoalReached(campaign);
        }
        
        logger.info(`Updated funding for campaign ID: ${message.campaignId}`);
      } catch (error) {
        errorHandler.handleConsumerError(error, message, queue);
      }
    });
    
    logger.info(`Subscribed to ${queue} queue`);
  }

  /**
   * Consume verification.approved events
   */
  async consumeVerificationApproved() {
    const queue = config.queues.verification.approved;
    
    await this.consume(queue, async (message) => {
      try {
        // Only process verification events for campaigns
        if (message.entityType !== 'campaign') {
          return;
        }
        
        logger.info(`Processing verification.approved event for campaign ID: ${message.entityId}`);
        
        // Update campaign verification status
        await campaignService.markVerified(
          message.entityId, 
          message.verificationId, 
          message.verifiedBy
        );
        
        logger.info(`Campaign ID: ${message.entityId} marked as verified`);
      } catch (error) {
        errorHandler.handleConsumerError(error, message, queue);
      }
    });
    
    logger.info(`Subscribed to ${queue} queue`);
  }

  /**
   * Consume verification.rejected events
   */
  async consumeVerificationRejected() {
    const queue = config.queues.verification.rejected;
    
    await this.consume(queue, async (message) => {
      try {
        // Only process verification events for campaigns
        if (message.entityType !== 'campaign') {
          return;
        }
        
        logger.info(`Processing verification.rejected event for campaign ID: ${message.entityId}`);
        
        // Update campaign verification status
        await campaignService.markVerificationRejected(
          message.entityId, 
          message.verificationId, 
          message.rejectedBy,
          message.rejectionReason
        );
        
        logger.info(`Campaign ID: ${message.entityId} verification rejected`);
      } catch (error) {
        errorHandler.handleConsumerError(error, message, queue);
      }
    });
    
    logger.info(`Subscribed to ${queue} queue`);
  }
}

// Export a singleton instance
module.exports = new CampaignConsumer();