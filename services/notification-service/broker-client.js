const BrokerClient = require('../../message-broker/src/lib/broker-client');
const { rabbitmq: config } = require('../../message-broker/src/config');
const logger = require('../../message-broker/src/utils/logger');

class NotificationBrokerClient extends BrokerClient {
    constructor() {
        super('notification');
    }

    async publishEmailNotification(notificationData) {
        await this.publishMessage(
            config.queues.notification.email,
            {
                ...notificationData,
                type: 'email',
                timestamp: new Date().toISOString()
            }
        );
    }

    async publishSMSNotification(notificationData) {
        await this.publishMessage(
            config.queues.notification.sms,
            {
                ...notificationData,
                type: 'sms',
                timestamp: new Date().toISOString()
            }
        );
    }

    async publishPushNotification(notificationData) {
        await this.publishMessage(
            config.queues.notification.push,
            {
                ...notificationData,
                type: 'push',
                timestamp: new Date().toISOString()
            }
        );
    }

    async consumeEmailNotifications(handler) {
        await this.consume(config.queues.notification.email, handler);
    }

    async consumeSMSNotifications(handler) {
        await this.consume(config.queues.notification.sms, handler);
    }

    async consumePushNotifications(handler) {
        await this.consume(config.queues.notification.push, handler);
    }
}

// Export a singleton instance
module.exports = new NotificationBrokerClient(); 