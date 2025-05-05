/**
 * Unit tests for the MQTT notification producer
 */

const mqtt = require('mqtt');
const NotificationProducer = require('../../src/services/notification/producer');

// Mock the MQTT client
jest.mock('mqtt', () => {
  const mockClient = {
    connect: jest.fn(() => mockClient),
    publish: jest.fn((topic, message, callback) => {
      callback(null);
    }),
    on: jest.fn(),
    end: jest.fn((callback) => {
      callback();
    })
  };
  return jest.fn(() => mockClient);
});

describe('NotificationProducer', () => {
  let producer;

  beforeEach(() => {
    producer = new NotificationProducer();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to the MQTT broker', async () => {
    await producer.connect();

    expect(mqtt).toHaveBeenCalledWith('mqtt://localhost:1884', expect.any(Object));
    expect(mqtt().on).toHaveBeenCalledWith('connect', expect.any(Function));
  });

  it('should publish an email notification', async () => {
    await producer.connect();
    const emailNotification = {
      recipient: 'test@example.com',
      subject: 'Test Email',
      body: 'This is a test email.'
    };

    await producer.publishEmailNotification(emailNotification);

    expect(mqtt().publish).toHaveBeenCalledWith(
      'notification/email',
      JSON.stringify(expect.objectContaining({
        ...emailNotification,
        type: 'email',
        timestamp: expect.any(String)
      })),
      expect.any(Function)
    );
  });

  it('should publish an SMS notification', async () => {
    await producer.connect();
    const smsNotification = {
      phoneNumber: '1234567890',
      message: 'This is a test SMS.'
    };

    await producer.publishSmsNotification(smsNotification);

    expect(mqtt().publish).toHaveBeenCalledWith(
      'notification/sms',
      JSON.stringify(expect.objectContaining({
        ...smsNotification,
        type: 'sms',
        timestamp: expect.any(String)
      })),
      expect.any(Function)
    );
  });

  it('should close the connection', async () => {
    await producer.connect();
    await producer.close();

    expect(mqtt().end).toHaveBeenCalled();
  });
}); 