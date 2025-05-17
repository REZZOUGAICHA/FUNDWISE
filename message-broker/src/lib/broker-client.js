const amqp = require('amqplib');
const { rabbitmq: config } = require('../config');
const logger = require('../utils/logger');

class BrokerClient {
    constructor(serviceName) {
        this.serviceName = serviceName;
        this.connection = null;
        this.channel = null;
        this.initialized = false;
    }

    async connect() {
        try {
            if (this.initialized) {
                return;
            }

            this.connection = await amqp.connect(config.connection);
            this.channel = await this.connection.createChannel();
            
            // Set up exchange for this service
            const exchangeName = config.exchanges[this.serviceName]?.name;
            if (exchangeName) {
                await this.channel.assertExchange(
                    exchangeName,
                    config.exchanges[this.serviceName].type,
                    config.exchanges[this.serviceName].options
                );
            }

            this.initialized = true;
               console.log(`[BrokerClient] Connected to RabbitMQ as ${this.serviceName}`);
         this.channel = await this.connection.createChannel(); // <== Fix here

      // Now use this.channel
      await this.channel.assertExchange('auth_exchange', 'topic', { durable: true });
      await this.channel.assertQueue('auth_login_queue', { durable: true });
      await this.channel.bindQueue('auth_login_queue', 'auth_exchange', 'auth.login');
            logger.info(`${this.serviceName} broker client connected successfully`);
        } catch (error) {
            logger.error(`Failed to connect ${this.serviceName} broker client: ${error.message}`);
            throw error;
        }
    }

    async publishMessage(routingKey, message, options = {}) {
        try {
            if (!this.initialized) {
                await this.connect();
            }

            const messageBuffer = Buffer.from(JSON.stringify(message));
            const exchangeName = config.exchanges[this.serviceName]?.name;

            await this.channel.publish(
                exchangeName,
                routingKey,
                messageBuffer,
                {
                    persistent: true,
                    contentType: 'application/json',
                    ...options
                }
            );

            logger.info(`Published message to ${routingKey}`);
        } catch (error) {
            logger.error(`Failed to publish message to ${routingKey}: ${error.message}`);
            throw error;
        }
    }

    async consume(queueName, handler, options = {}) {
        try {
            if (!this.initialized) {
                await this.connect();
            }

            await this.channel.assertQueue(queueName, {
                durable: true,
                ...options
            });

            await this.channel.consume(queueName, async (msg) => {
                if (msg !== null) {
                    try {
                        const content = JSON.parse(msg.content.toString());
                        await handler(content);
                        this.channel.ack(msg);
                    } catch (error) {
                        logger.error(`Error processing message: ${error.message}`);
                        // Reject message and requeue if processing fails
                        this.channel.nack(msg, false, true);
                    }
                }
            });

            logger.info(`Started consuming from queue: ${queueName}`);
        } catch (error) {
            logger.error(`Failed to consume from queue ${queueName}: ${error.message}`);
            throw error;
        }
    }

    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.initialized = false;
            logger.info(`Closed ${this.serviceName} broker client connection`);
        } catch (error) {
            logger.error(`Error closing ${this.serviceName} broker client: ${error.message}`);
            throw error;
        }
    }
}

module.exports = BrokerClient; 