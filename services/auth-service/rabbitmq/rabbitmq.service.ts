import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

// Import your JavaScript broker
// Note: You might need to adjust the path based on your project structure
const broker = require('../../path/to/your/broker');

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Initialize broker when the service starts
    if (!broker.initialized) {
      await broker.init();
    }
  }

  async onModuleDestroy() {
    // Clean up when the service is destroyed
    await broker.close();
  }

  /**
   * Publish an authentication event to RabbitMQ
   * @param eventType The type of authentication event (e.g., 'loggedIn', 'loggedOut')
   * @param payload The data to send with the event
   */
  async publishAuthEvent(eventType: string, payload: any): Promise<boolean> {
    try {
      // We'll use a Producer instance to publish the message
      const Producer = require('../../path/to/your/Producer');
      const producer = new Producer();
      
      // Define the exchange and routing key based on your configuration
      const exchange = 'verification'; // This should match an exchange name in your config
      const routingKey = `auth.${eventType}`; // Create a routing pattern
      
      // Add any additional metadata to the message
      const message = {
        ...payload,
        eventType,
        source: 'auth-service',
        timestamp: payload.timestamp || new Date().toISOString(),
      };
      
      // Publish the message
      return await producer.publish(exchange, routingKey, message);
    } catch (error) {
      console.error(`Failed to publish auth event (${eventType}):`, error);
      throw error;
    }
  }

  /**
   * Subscribe to auth events
   * @param queueName The queue to subscribe to
   * @param handler The function to handle received messages
   */
  async subscribeToAuthEvents(queueName: string, handler: (content: any, msg: any) => Promise<void>): Promise<any> {
    try {
      const Consumer = require('../../path/to/your/Consumer');
      const consumer = new Consumer();
      
      return await consumer.subscribe(queueName, handler);
    } catch (error) {
      console.error(`Failed to subscribe to queue ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a queue
   * @param consumerTag The consumer tag to cancel
   */
  async unsubscribe(consumerTag: string): Promise<boolean> {
    try {
      const Consumer = require('../../path/to/your/Consumer');
      const consumer = new Consumer();
      
      return await consumer.unsubscribe(consumerTag);
    } catch (error) {
      console.error(`Failed to unsubscribe consumer ${consumerTag}:`, error);
      throw error;
    }
  }
}