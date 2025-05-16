/**
 * Test script for RabbitMQ messaging
 * 
 * Run with: node test-messaging.js
 */

const MessageBroker = require('./messaging/broker');
const Producer = require('./messaging/producer');
const Consumer = require('./messaging/consumer');
const config = require('./config');

async function main() {
  try {
    console.log('Initializing RabbitMQ connection...');
    await MessageBroker.init();
    console.log('Connected to RabbitMQ');

    const producer = new Producer();
    const consumer = new Consumer();

    // Set up consumers for different message types
    await setupConsumers(consumer);

    // Generate test messages
    await generateTestMessages(producer);

    // Keep the script running to receive messages
    console.log('Waiting for messages. Press Ctrl+C to exit.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

async function setupConsumers(consumer: { subscribe: (arg0: string, arg1: { (content: { email: any; }): Promise<void>; (content: { email: any; }): Promise<void>; (content: any): Promise<void>; (content: any): Promise<void>; (content: any): Promise<void>; (content: any): Promise<void>; }) => any; }) {
  // Auth events consumer
  await consumer.subscribe('auth.user.registered', async (content: { email: any; }) => {
    console.log(`[AUTH] User registered: ${content.email}`);
  });

  await consumer.subscribe('auth.user.logged_in', async (content: { email: any; }) => {
    console.log(`[AUTH] User logged in: ${content.email}`);
  });

  // Notification events consumer
  await consumer.subscribe('notification.email', async (content) => {
    console.log(`[NOTIFICATION] Email to: ${content.recipient}, Subject: ${content.subject}`);
  });

  await consumer.subscribe('notification.sms', async (content) => {
    console.log(`[NOTIFICATION] SMS to: ${content.recipient}`);
  });

  // Donation events consumer
  await consumer.subscribe('donation.new', async (content) => {
    console.log(`[DONATION] New donation ${content.donationId}: ${content.amount} ${content.currency}`);
  });

  await consumer.subscribe('donation.status', async (content) => {
    console.log(`[DONATION] Status update for ${content.donationId}: ${content.status}`);
  });

  console.log('All consumers set up successfully');
}

async function generateTestMessages(producer: { publish: (arg0: string, arg1: string, arg2: { email?: string; timestamp: string; ip?: string; userAgent?: string; recipient?: string; subject?: string; content?: string; priority?: string; donationId?: string; userId?: string; amount?: number; currency?: string; status?: string; }) => any; }) {
  // Test auth events
  await producer.publish(
    'auth_exchange',
    'auth.user.registered',
    {
      email: 'newuser@example.com',
      timestamp: new Date().toISOString(),
      ip: '192.168.1.1'
    }
  );
  console.log('Published user registered event');

  await producer.publish(
    'auth_exchange',
    'auth.user.logged_in',
    {
      email: 'user@example.com',
      timestamp: new Date().toISOString(),
      ip: '192.168.1.2',
      userAgent: 'Mozilla/5.0'
    }
  );
  console.log('Published user login event');

  // Test notification events
  await producer.publish(
    'notification_exchange',
    'notification.email',
    {
      recipient: 'user@example.com',
      subject: 'Welcome to our platform',
      content: 'Thank you for registering with us!',
      timestamp: new Date().toISOString(),
      priority: 'high'
    }
  );
  console.log('Published email notification event');

  // Test donation events
  await producer.publish(
    'donation_exchange',
    'donation.new',
    {
      donationId: `don_${Date.now()}`,
      userId: 'user123',
      amount: 100.00,
      currency: 'USD',
      timestamp: new Date().toISOString()
    }
  );
  console.log('Published new donation event');

  await producer.publish(
    'donation_exchange',
    'donation.status',
    {
      donationId: `don_${Date.now()}`,
      userId: 'user123',
      amount: 50.00,
      currency: 'USD',
      status: 'completed',
      timestamp: new Date().toISOString()
    }
  );
  console.log('Published donation status event');
}

// Run the test
main().catch(console.error);