const mqtt = require('mqtt');
const logger = require('../message-broker/src/utils/logger');

console.log('Starting MQTT test...');

// Create MQTT clients for testing
const publisher = mqtt.connect('mqtt://localhost:1884', {
  clientId: 'test-publisher',
  clean: true
});

const subscriber = mqtt.connect('mqtt://localhost:1884', {
  clientId: 'test-subscriber',
  clean: true
});

// Test topics
const emailTopic = 'notification/email';
const smsTopic = 'notification/sms';

// Test messages
const emailMessage = {
  recipient: 'test@example.com',
  subject: 'Test Email',
  body: 'This is a test email message'
};

const smsMessage = {
  phoneNumber: '1234567890',
  message: 'This is a test SMS message'
};

// Handle publisher connection
publisher.on('connect', () => {
  console.log('Publisher connected to MQTT broker');
  logger.info('Publisher connected to MQTT broker');
  
  // Publish test messages
  publisher.publish(emailTopic, JSON.stringify(emailMessage), (err) => {
    if (err) {
      console.error('Error publishing email message:', err);
      logger.error('Error publishing email message:', err);
    } else {
      console.log('Email message published successfully');
      logger.info('Email message published successfully');
    }
  });

  publisher.publish(smsTopic, JSON.stringify(smsMessage), (err) => {
    if (err) {
      console.error('Error publishing SMS message:', err);
      logger.error('Error publishing SMS message:', err);
    } else {
      console.log('SMS message published successfully');
      logger.info('SMS message published successfully');
    }
  });
});

// Handle subscriber connection
subscriber.on('connect', () => {
  console.log('Subscriber connected to MQTT broker');
  logger.info('Subscriber connected to MQTT broker');
  
  // Subscribe to topics
  subscriber.subscribe([emailTopic, smsTopic], (err) => {
    if (err) {
      console.error('Error subscribing to topics:', err);
      logger.error('Error subscribing to topics:', err);
    } else {
      console.log('Subscribed to email and SMS topics');
      logger.info('Subscribed to email and SMS topics');
    }
  });
});

// Handle incoming messages
subscriber.on('message', (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    logger.info(`Received message on topic ${topic}:`, payload);
  } catch (error) {
    logger.error('Error processing message:', error);
  }
});

// Handle errors
publisher.on('error', (err) => {
  console.error('Publisher error:', err);
  logger.error('Publisher error:', err);
});

subscriber.on('error', (err) => {
  console.error('Subscriber error:', err);
  logger.error('Subscriber error:', err);
});

// Clean up on exit
process.on('SIGINT', () => {
  console.log('Cleaning up...');
  publisher.end();
  subscriber.end();
  process.exit();
}); 