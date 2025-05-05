/**
 * Notification Service Consumer (MQTT)
 * 
 * Consumes notification messages from MQTT topics.
 */

const Consumer = require('../../message-broker/src/lib/consumer');
const { rabbitmq: config } = require('../../message-broker/config');
const logger = require('../../message-broker/src/utils/logger');
const notificationService = require('../campaign-service');

class NotificationConsumer extends Consumer {
  constructor() {
    super();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Set up consumer for email notifications
      await this.consumeEmailNotification();
      
      // Set up consumer for SMS notifications
      await this.consumeSMSNotification();
      
      // Set up consumer for push notifications
      await this.consumePushNotification();
      
      this.initialized = true;
      logger.info('Notification consumer initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize notification consumer: ${error.message}`);
      throw error;
    }
  }

  async consumeEmailNotification() {
    const queue = config.queues.notification.email;
    
    await this.consume(queue, async (message) => {
      try {
        logger.info(`Processing email notification for recipient: ${message.recipient}`);
        
        // Process the email notification
        await notificationService.sendEmail({
          recipient: message.recipient,
          subject: message.subject,
          template: message.template,
          data: message.data
        });

        logger.info(`Sent email notification to ${message.recipient}`);
      } catch (error) {
        logger.error(`Error processing email notification: ${error.message}`);
        throw error;
      }
    });
  }

  async consumeSMSNotification() {
    const queue = config.queues.notification.sms;
    
    await this.consume(queue, async (message) => {
      try {
        logger.info(`Processing SMS notification for recipient: ${message.recipient}`);
        
        // Process the SMS notification
        await notificationService.sendSMS({
          recipient: message.recipient,
          template: message.template,
          data: message.data
        });

        logger.info(`Sent SMS notification to ${message.recipient}`);
      } catch (error) {
        logger.error(`Error processing SMS notification: ${error.message}`);
        throw error;
      }
    });
  }

  async consumePushNotification() {
    const queue = config.queues.notification.push;
    
    await this.consume(queue, async (message) => {
      try {
        logger.info(`Processing push notification for recipient: ${message.recipient}`);
        
        // Process the push notification
        await notificationService.sendPushNotification({
          recipient: message.recipient,
          template: message.template,
          data: message.data
        });

        logger.info(`Sent push notification to ${message.recipient}`);
      } catch (error) {
        logger.error(`Error processing push notification: ${error.message}`);
        throw error;
      }
    });
  }
}

module.exports = NotificationConsumer;
