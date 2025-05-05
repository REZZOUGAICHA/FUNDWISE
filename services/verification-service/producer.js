const amqp = require('amqplib');
const { rabbitmq: config } = require('../../config');
const logger = require('../../utils/logger');

class VerificationProducer {
    constructor() {
        this.connection = null;
        this.channel = null;
    }

    async connect() {
        try {
            this.connection = await amqp.connect(config.connection);
            this.channel = await this.connection.createChannel();
            
            // Set up exchange
            await this.channel.assertExchange(
                config.exchanges.verification.name,
                config.exchanges.verification.type,
                config.exchanges.verification.options
            );

            logger.info('Verification producer connected to RabbitMQ');
        } catch (error) {
            logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
            throw error;
        }
    }

    async publishMessage(routingKey, message) {
        try {
            if (!this.channel) {
                await this.connect();
            }

            const messageBuffer = Buffer.from(JSON.stringify(message));
            
            await this.channel.publish(
                config.exchanges.verification.name,
                routingKey,
                messageBuffer,
                {
                    persistent: true,
                    contentType: 'application/json'
                }
            );

            logger.info(`Published message to ${routingKey}`);
        } catch (error) {
            logger.error(`Failed to publish message to ${routingKey}: ${error.message}`);
            throw error;
        }
    }

    async publishDocumentRequest(verificationId, entityId, requiredDocumentTypes, reason) {
        const message = {
            verificationId,
            entityId,
            requiredDocumentTypes,
            reason,
            timestamp: new Date().toISOString()
        };

        await this.publishMessage(
            config.queues.verification.documentRequested,
            message
        );
    }

    async publishVerificationStatus(verificationId, status, details) {
        const message = {
            verificationId,
            status,
            details,
            timestamp: new Date().toISOString()
        };

        await this.publishMessage(
            config.queues.verification.status,
            message
        );
    }

    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            logger.info('Closed RabbitMQ connection');
        } catch (error) {
            logger.error(`Error closing RabbitMQ connection: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new VerificationProducer(); 