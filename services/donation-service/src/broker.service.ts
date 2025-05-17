import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export const BrokerClient = require('C:/Fundwise/FUNDWISE/message-broker/src/lib/broker-client');

interface RabbitMQMessage {
  content: Buffer;
  fields: {
    deliveryTag: number;
    redelivered: boolean;
    exchange: string;
    routingKey: string;
  };
  properties: {
    contentType: string;
    contentEncoding: string;
    headers: Record<string, any>;
    deliveryMode: number;
    priority: number;
    correlationId: string;
    replyTo: string;
    expiration: string;
    messageId: string;
    timestamp: number;
    type: string;
    userId: string;
    appId: string;
  };
}

@Injectable()
export class BrokerService implements OnModuleInit, OnModuleDestroy {
  private client: any;
  private readonly QUEUE_NAME = 'donation_queue';
  private readonly EXCHANGE_NAME = 'donation_exchange';
  private readonly ROUTING_KEY = 'donation.created';

  constructor() {
    this.client = new BrokerClient('donation'); // 'donation' is the service name
  }

  async onModuleInit() {
    await this.client.connect();
    
    // Create and bind queue
    await this.client.channel.assertQueue(this.QUEUE_NAME, {
      durable: true,
    });

    // Create exchange if it doesn't exist
    await this.client.channel.assertExchange(this.EXCHANGE_NAME, 'topic', {
      durable: true,
    });

    // Bind queue to exchange with the exact routing key
    await this.client.channel.bindQueue(
      this.QUEUE_NAME,
      this.EXCHANGE_NAME,
      this.ROUTING_KEY
    );

    console.log(`[BrokerService] Queue ${this.QUEUE_NAME} bound to exchange ${this.EXCHANGE_NAME} with routing key ${this.ROUTING_KEY}`);
  }

  async publish(routingKey: string, message: any) {
    if (!this.client.channel) {
      throw new Error('Channel not initialized');
    }

    const messageContent = {
      pattern: { cmd: this.ROUTING_KEY },
      data: message
    };

    const messageBuffer = Buffer.from(JSON.stringify(messageContent));
    
    return this.client.channel.publish(
      this.EXCHANGE_NAME,
      this.ROUTING_KEY,
      messageBuffer,
      {
        persistent: true,
        contentType: 'application/json',
        headers: {
          pattern: { cmd: this.ROUTING_KEY }
        }
      }
    );
  }

  async consume(handler: (msg: any) => Promise<void>) {
    if (!this.client.channel) {
      throw new Error('Channel not initialized');
    }

    return this.client.channel.consume(this.QUEUE_NAME, async (msg: RabbitMQMessage | null) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          if (content && content.data) {
            await handler(content.data);
          } else {
            console.warn('Received message without data property:', content);
          }
          this.client.channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          this.client.channel.nack(msg, false, false);
        }
      }
    });
  }

  async onModuleDestroy() {
    await this.client.close();
  }
} 