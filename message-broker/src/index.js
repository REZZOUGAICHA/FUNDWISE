/**
 * Message Broker Main Entry Point
 * 
 * Initializes and exports the message broker functionality.
 */

const broker = require('./lib/broker');
const Producer = require('./lib/producer');
const Consumer = require('./lib/consumer');
const logger = require('./utils/logger');

// Export service-specific producers
const donationProducer = require('./services/donation/producer');
const campaignProducer = require('./services/campaign/producer');
const verificationProducer = require('./services/verification/producer');
const notificationProducer = require('./services/notification/producer');

// Initialize broker when this module is imported
(async () => {
  try {
    logger.info('Initializing message broker...');
    await broker.init();
    logger.info('Message broker initialized successfully');
  } catch (error) {
    logger.error(`Failed to initialize message broker: ${error.message}`);
    // Not exiting as this might be used as a library
  }
})();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received, shutting down message broker');
  await broker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received, shutting down message broker');
  await broker.close();
  process.exit(0);
});

// Export the modules
module.exports = {
  broker,
  Producer,
  Consumer,
  services: {
    donation: donationProducer,
    campaign: campaignProducer,
    verification: verificationProducer,
    notification: notificationProducer
  },
  // Factory methods
  createProducer: () => new Producer(),
  createConsumer: () => new Consumer()
};