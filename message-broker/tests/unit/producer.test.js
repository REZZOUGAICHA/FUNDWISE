/**
 * Unit tests for the MQTT notification producer
 */

const mqtt = require('mqtt');
const NotificationProducer = require('../../src/services/notification/producer');

// Mock the MQTT client
jest.mock('mqtt', () => {
  const mockClient = {
    publish: jest.fn((topic, message, options, callback) => {
      callback(null);
    }),
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

  it('should publish an email notification', async () => {
    const emailNotification = {
      recipient: 'test@example.com',
      subject: 'Test Email',
      body: 'This is a test email.'
    };

    await producer.publishEmailNotification(emailNotification);

    expect(mqtt().publish).toHaveBeenCalledWith(
      'notification/email',
      JSON.stringify(emailNotification),
      expect.any(Object),
      expect.any(Function)
    );
  });

  it('should publish an SMS notification', async () => {
    const smsNotification = {
      phoneNumber: '1234567890',
      message: 'This is a test SMS.'
    };

    await producer.publishSmsNotification(smsNotification);

    expect(mqtt().publish).toHaveBeenCalledWith(
      'notification/sms',
      JSON.stringify(smsNotification),
      expect.any(Object),
      expect.any(Function)
    );
  });
});
