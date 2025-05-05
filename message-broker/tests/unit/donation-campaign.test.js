const mqtt = require('mqtt');
const logger = require('../../src/utils/logger');

describe('Donation and Campaign MQTT Tests', () => {
  let publisher;
  let subscriber;
  const testCampaign = {
    id: 'test-campaign-123',
    title: 'Test Campaign',
    description: 'This is a test campaign',
    targetAmount: 1000,
    currentAmount: 0,
    status: 'active'
  };

  const testDonation = {
    id: 'test-donation-123',
    campaignId: 'test-campaign-123',
    amount: 100,
    donorId: 'test-donor-123',
    status: 'pending'
  };

  beforeAll(async () => {
    // Connect publisher
    publisher = mqtt.connect('mqtt://localhost:1884', {
      clientId: `test-publisher-${Date.now()}`
    });

    // Connect subscriber
    subscriber = mqtt.connect('mqtt://localhost:1884', {
      clientId: `test-subscriber-${Date.now()}`
    });

    // Wait for connections
    await new Promise((resolve) => {
      publisher.on('connect', () => {
        logger.info('Publisher connected to MQTT broker');
        resolve();
      });
    });

    await new Promise((resolve) => {
      subscriber.on('connect', () => {
        logger.info('Subscriber connected to MQTT broker');
        resolve();
      });
    });

    // Subscribe to topics
    subscriber.subscribe(['campaign/+/update', 'donation/+/create', 'donation/+/update']);
    logger.info('Subscribed to campaign and donation topics');
  });

  afterAll(async () => {
    // Close connections
    await new Promise((resolve) => {
      publisher.end(() => {
        logger.info('Publisher connection closed');
        resolve();
      });
    });

    await new Promise((resolve) => {
      subscriber.end(() => {
        logger.info('Subscriber connection closed');
        resolve();
      });
    });
  });

  it('should publish and receive campaign updates', async () => {
    const campaignTopic = `campaign/${testCampaign.id}/update`;
    
    // Set up message handler
    const messagePromise = new Promise((resolve) => {
      subscriber.on('message', (topic, message) => {
        if (topic === campaignTopic) {
          const receivedCampaign = JSON.parse(message.toString());
          resolve(receivedCampaign);
        }
      });
    });

    // Publish campaign update
    publisher.publish(campaignTopic, JSON.stringify(testCampaign), (err) => {
      if (err) {
        logger.error(`Error publishing campaign update: ${err.message}`);
      } else {
        logger.info('Campaign update published successfully');
      }
    });

    // Wait for message and verify
    const receivedCampaign = await messagePromise;
    expect(receivedCampaign).toEqual(testCampaign);
  });

  it('should publish and receive donation creation', async () => {
    const donationTopic = `donation/${testDonation.id}/create`;
    
    // Set up message handler
    const messagePromise = new Promise((resolve) => {
      subscriber.on('message', (topic, message) => {
        if (topic === donationTopic) {
          const receivedDonation = JSON.parse(message.toString());
          resolve(receivedDonation);
        }
      });
    });

    // Publish donation creation
    publisher.publish(donationTopic, JSON.stringify(testDonation), (err) => {
      if (err) {
        logger.error(`Error publishing donation creation: ${err.message}`);
      } else {
        logger.info('Donation creation published successfully');
      }
    });

    // Wait for message and verify
    const receivedDonation = await messagePromise;
    expect(receivedDonation).toEqual(testDonation);
  });

  it('should publish and receive donation status updates', async () => {
    const donationTopic = `donation/${testDonation.id}/update`;
    const updatedDonation = { ...testDonation, status: 'completed' };
    
    // Set up message handler
    const messagePromise = new Promise((resolve) => {
      subscriber.on('message', (topic, message) => {
        if (topic === donationTopic) {
          const receivedDonation = JSON.parse(message.toString());
          resolve(receivedDonation);
        }
      });
    });

    // Publish donation update
    publisher.publish(donationTopic, JSON.stringify(updatedDonation), (err) => {
      if (err) {
        logger.error(`Error publishing donation update: ${err.message}`);
      } else {
        logger.info('Donation update published successfully');
      }
    });

    // Wait for message and verify
    const receivedDonation = await messagePromise;
    expect(receivedDonation).toEqual(updatedDonation);
  });
}); 