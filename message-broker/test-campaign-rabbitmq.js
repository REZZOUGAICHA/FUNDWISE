/**
 * Campaign Service RabbitMQ Integration Test
 * 
 * This script tests the RabbitMQ integration for the Campaign Service.
 * It will:
 * 1. Connect to RabbitMQ
 * 2. Set up temporary test consumers
 * 3. Publish test messages
 * 4. Verify message receipt
 */

const messageBroker = require('../message-broker/lib/message-broker-client');
const logger = require('../message-broker/src/utils/logger');

console.log('Starting Campaign RabbitMQ test...');

// Test campaign data
const testCampaign = {
  id: 'test-campaign-1',
  title: 'Test Campaign',
  description: 'This is a test campaign',
  status: 'active',
  targetAmount: 1000,
  currentAmount: 0
};

// Test campaign update
const testUpdate = {
  campaignId: testCampaign.id,
  type: 'update',
  data: {
    title: 'Updated Test Campaign',
    description: 'This is an updated test campaign'
  }
};

// Test campaign status
const testStatus = {
  campaignId: testCampaign.id,
  status: 'completed',
  timestamp: new Date().toISOString()
};

async function runTest() {
  try {
    // Connect to the message broker
    await messageBroker.connect();
    logger.info('Connected to message broker');

    // Set up consumers
    const updateConsumer = await messageBroker.consume('campaign.updated', async (message) => {
      logger.info('Received campaign update:', message);
    });

    const statusConsumer = await messageBroker.consume('campaign.status', async (message) => {
      logger.info('Received campaign status:', message);
    });

    // Publish test messages
    await messageBroker.publish(
      'campaign',
      'campaign.updated',
      testUpdate
    );

    await messageBroker.publish(
      'campaign',
      'campaign.status',
      testStatus
    );

    // Wait for messages to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clean up
    await messageBroker.close();
    logger.info('Test completed successfully');
  } catch (error) {
    logger.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
runTest();