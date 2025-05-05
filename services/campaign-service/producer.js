/**
 * Campaign Service Producer
 * 
 * Specialized producer for campaign-related messages.
 */

const Producer = require('../../lib/producer');
const { rabbitmq: config } = require('../../config');
const logger = require('../../utils/logger');

class CampaignProducer extends Producer {
  /**
   * Publish a campaign created event
   * 
   * @param {Object} campaign - The campaign data
   * @param {Object} options - Publishing options (optional)
   * @returns {Promise<boolean>} - Success status
   */
  async publishCampaignCreated(campaign, options = {}) {
    const exchange = config.exchanges.campaign.name;
    const routingKey = 'campaign.created';
    
    // Enrich the message with metadata
    const message = {
      ...campaign,
      eventType: 'campaign.created',
      timestamp: new Date().toISOString()
    };
    
    logger.info(`Publishing campaign created event for campaign ID: ${campaign.id}`);
    return this.publish(exchange, routingKey, message, options);
  }

  /**
   * Publish a campaign updated event
   * 
   * @param {Object} campaign - The updated campaign data
   * @param {Object} options - Publishing options (optional)
   * @returns {Promise<boolean>} - Success status
   */
  async publishCampaignUpdated(campaign, options = {}) {
    const exchange = config.exchanges.campaign.name;
    const routingKey = 'campaign.updated';
    
    // Enrich the message with metadata
    const message = {
      ...campaign,
      eventType: 'campaign.updated',
      timestamp: new Date().toISOString()
    };
    
    logger.info(`Publishing campaign updated event for campaign ID: ${campaign.id}`);
    return this.publish(exchange, routingKey, message, options);
  }

  /**
   * Publish a campaign closed event
   * 
   * @param {Object} campaign - The campaign data
   * @param {Object} options - Publishing options (optional)
   * @returns {Promise<boolean>} - Success status
   */
  async publishCampaignClosed(campaign, options = {}) {
    const exchange = config.exchanges.campaign.name;
    const routingKey = 'campaign.closed';
    
    // Enrich the message with metadata
    const message = {
      id: campaign.id,
      status: 'closed',
      closedReason: campaign.closedReason,
      eventType: 'campaign.closed',
      timestamp: new Date().toISOString()
    };
    
    logger.info(`Publishing campaign closed event for campaign ID: ${campaign.id}`);
    return this.publish(exchange, routingKey, message, options);
  }

  /**
   * Publish a campaign goal reached event
   * 
   * @param {Object} campaign - The campaign data
   * @param {Object} options - Publishing options (optional)
   * @returns {Promise<boolean>} - Success status
   */
  async publishCampaignGoalReached(campaign, options = {}) {
    const exchange = config.exchanges.campaign.name;
    const routingKey = 'campaign.goal.reached';
    
    // Enrich the message with metadata
    const message = {
      id: campaign.id,
      title: campaign.title,
      goalAmount: campaign.goalAmount,
      currentAmount: campaign.currentAmount,
      eventType: 'campaign.goal.reached',
      timestamp: new Date().toISOString()
    };
    
    logger.info(`Publishing campaign goal reached event for campaign ID: ${campaign.id}`);
    return this.publish(exchange, routingKey, message, options);
  }

  /**
   * Publish a campaign verification request
   * 
   * @param {Object} campaignVerification - The verification request data
   * @param {Object} options - Publishing options (optional)
   * @returns {Promise<boolean>} - Success status
   */
  async publishCampaignVerificationRequest(campaignVerification, options = {}) {
    const exchange = config.exchanges.verification.name;
    const routingKey = 'verification.requested';
    
    // Enrich the message with metadata
    const message = {
      ...campaignVerification,
      eventType: 'verification.requested',
      source: 'campaign-service',
      timestamp: new Date().toISOString()
    };
    
    logger.info(`Publishing verification request for campaign ID: ${campaignVerification.campaignId}`);
    return this.publish(exchange, routingKey, message, options);
  }
}

// Export a singleton instance
module.exports = new CampaignProducer();