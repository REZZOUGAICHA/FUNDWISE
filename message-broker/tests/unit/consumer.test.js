/**
 * Unit tests for the MQTT notification consumer
 */

const mqtt = require('mqtt');
const NotificationConsumer = require('../../src/services/notification/consumer');

// Mock the MQTT client
jest.mock('mqtt', () => {
    const mockClient = {
      subscribe: jest.fn((topic, callback) => callback(null)),
      unsubscribe: jest.fn((topic, callback) => callback(null)),
      on: jest.fn(),
      end: jest.fn((callback) => callback()),
    };
  
    return {
      connect: jest.fn(() => mockClient), // 👈 Return an object with a `connect` method
    };
  });
  

describe('NotificationConsumer', () => {
  let consumer;

  beforeEach(() => {
    consumer = new NotificationConsumer();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to the MQTT broker', async () => {
    await consumer.connect();

    expect(mqtt).toHaveBeenCalledWith('mqtt://localhost:5672', expect.any(Object));
    expect(mqtt().on).toHaveBeenCalledWith('connect', expect.any(Function));
  });

  it('should subscribe to a topic', async () => {
    await consumer.connect();
    const topic = 'notification/email';
    const handler = jest.fn();

    await consumer.subscribe(topic, handler);

    expect(mqtt().subscribe).toHaveBeenCalledWith(topic, expect.any(Function));
  });

  it('should unsubscribe from a topic', async () => {
    await consumer.connect();
    const topic = 'notification/email';

    await consumer.unsubscribe(topic);

    expect(mqtt().unsubscribe).toHaveBeenCalledWith(topic, expect.any(Function));
  });

  it('should process messages from a topic', async () => {
    await consumer.connect();
    const topic = 'notification/email';
    const handler = jest.fn();
    await consumer.subscribe(topic, handler);

    consumer.startListening();

    const message = JSON.stringify({ recipient: 'test@example.com', subject: 'Test Email' });
    mqtt().on.mock.calls.find(call => call[0] === 'message')[1](topic, message);

    expect(handler).toHaveBeenCalledWith(JSON.parse(message));
  });
});
