const MessageBrokerClient = require('./lib/MessageBrokerClient');
const logger = require('./utils/logger');

console.log('Starting Campaign MQTT test...');

// Create message broker clients
const publisher = new MessageBrokerClient('mqtt');
const subscriber = new MessageBrokerClient('mqtt');

// Test campaign data
const testCampaign = {
  id: 'test-campaign-123',
  title: 'Test Campaign',
  description: 'This is a test campaign',
  targetAmount: 1000,
  currentAmount: 0,
  status: 'active'
};

// Test topics
const campaignUpdateTopic = `campaign/${testCampaign.id}/update`;
const campaignStatusTopic = `campaign/${testCampaign.id}/status`;

async function runTest() {
  try {
    // Connect clients
    await publisher.connect();
    await subscriber.connect();

    // Subscribe to topics
    await subscriber.subscribe(campaignUpdateTopic, (message) => {
      console.log(`Received campaign update:`, message);
      logger.info(`Received campaign update:`, message);
    });

    await subscriber.subscribe(campaignStatusTopic, (message) => {
      console.log(`Received campaign status:`, message);
      logger.info(`Received campaign status:`, message);
    });

    // Publish campaign update
    await publisher.publish(campaignUpdateTopic, testCampaign);
    console.log('Campaign update published');
    logger.info('Campaign update published');

    // Publish campaign status
    const statusUpdate = {
      id: testCampaign.id,
      status: 'active',
      currentAmount: 500,
      timestamp: new Date().toISOString()
    };

    await publisher.publish(campaignStatusTopic, statusUpdate);
    console.log('Campaign status published');
    logger.info('Campaign status published');

    // Wait for messages to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));

  } catch (error) {
    console.error('Test failed:', error);
    logger.error('Test failed:', error);
  } finally {
    // Clean up
    await publisher.close();
    await subscriber.close();
    console.log('Test completed');
    logger.info('Test completed');
  }
}

// Run the test
runTest().catch(console.error); 