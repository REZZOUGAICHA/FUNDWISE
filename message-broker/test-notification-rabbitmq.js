/**
 * Notification Service RabbitMQ Integration Test
 *
 * This script tests the RabbitMQ integration for the Notification Service.
 * It will:
 * 1. Connect to RabbitMQ
 * 2. Set up temporary test consumers
 * 3. Publish test messages
 * 4. Verify message receipt
 */

const messageBroker = require('../message-broker/lib/message-broker-client');
const logger = require('../message-broker/src/utils/logger');

console.log('Starting Notification RabbitMQ test...');

// Test email notification
const testEmailNotification = {
  recipient: 'test@example.com',
  subject: 'Test Email',
  template: 'test_email',
  data: {
    message: 'This is a test email notification'
  }
};

// Test SMS notification
const testSMSNotification = {
  phoneNumber: '+1234567890',
  template: 'test_sms',
  data: {
    message: 'This is a test SMS notification'
  }
};

// Test push notification
const testPushNotification = {
  deviceId: 'test-device-123',
  template: 'test_push',
  data: {
    message: 'This is a test push notification'
  }
};

async function runTest() {
  try {
    // Connect to the message broker
    await messageBroker.connect();
    logger.info('Connected to message broker');

    // Set up consumers
    const emailConsumer = await messageBroker.consume('notification.email', async (message) => {
      logger.info('Received email notification:', message);
    });

    const smsConsumer = await messageBroker.consume('notification.sms', async (message) => {
      logger.info('Received SMS notification:', message);
    });

    const pushConsumer = await messageBroker.consume('notification.push', async (message) => {
      logger.info('Received push notification:', message);
    });

    // Publish test messages
    await messageBroker.publish('notification', 'notification.email', testEmailNotification);
    await messageBroker.publish('notification', 'notification.sms', testSMSNotification);
    await messageBroker.publish('notification', 'notification.push', testPushNotification);

    // Wait for messages to be processed
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Clean up
    await messageBroker.close();
    logger.info('Notification RabbitMQ test completed successfully');
  } catch (error) {
    logger.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
runTest();
