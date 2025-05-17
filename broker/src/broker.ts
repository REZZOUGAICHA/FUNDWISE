import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config';
import { 
  RabbitMQConfig, 
  MessagePayload, 
  MessageHandler, 
  ConsumeOptions 
} from './type';

export class MessageBroker {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private config: RabbitMQConfig;
  private initialized: boolean = false;
  private consumers: Map<string, { consumerTag: string }> = new Map();

  constructor(customConfig?: RabbitMQConfig) {
    this.config = customConfig || config.rabbitmq;
  }

  /**
   * Initialize connection to RabbitMQ and setup exchanges and queues
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Create connection
     this.connection = await amqp.connect(this.config.connection) as unknown as Connection;
      // Handle connection errors and reconnection
      this.connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err);
        this.reconnect();
      });
      
      this.connection.on('close', () => {
        console.warn('RabbitMQ connection closed. Attempting to reconnect...');
        this.reconnect();
      });

      // Create channel
      this.channel = await this.connection.createChannel();
      
      // Setup exchanges
      await this.setupExchanges();
      
      // Setup queues
      await this.setupQueues();
      
      this.initialized = true;
      console.log('Message broker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize message broker:', error);
      throw error;
    }
  }

  /**
   * Setup exchanges based on configuration
   */
  private async setupExchanges(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    const exchanges = Object.values(this.config.exchanges);
    
    for (const exchange of exchanges) {
      await this.channel.assertExchange(
        exchange.name,
        exchange.type,
        exchange.options
      );
      console.log(`Exchange ${exchange.name} asserted`);
    }
  }

  /**
   * Setup queues based on configuration
   */
  private async setupQueues(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    const queues = Object.values(this.config.queues);
    
    for (const queue of queues) {
      // Assert queue
      await this.channel.assertQueue(queue.name, queue.options);
      
      // Find the exchange in our config
      const exchangeName = queue.exchange;
      const exchange = Object.values(this.config.exchanges).find(
        (e) => e.name === exchangeName
      );
      
      if (!exchange) {
        console.warn(`Exchange ${exchangeName} not found for queue ${queue.name}`);
        continue;
      }
      
      // Bind queue to exchange with binding key
      await this.channel.bindQueue(queue.name, exchange.name, queue.bindingKey);
      console.log(`Queue ${queue.name} bound to exchange ${exchange.name} with key ${queue.bindingKey}`);
    }
  }

  /**
   * Publish a message to an exchange with a routing key
   */
  public async publish(
    exchange: string,
    routingKey: string,
    message: any,
    options: amqp.Options.Publish = {}
  ): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    // Find the exchange configuration
    const exchangeConfig = Object.values(this.config.exchanges).find(
      (e) => e.name === exchange
    );

    if (!exchangeConfig) {
      throw new Error(`Exchange ${exchange} not found in configuration`);
    }

    // Create a message payload with metadata
    const payload: MessagePayload = {
      data: message,
      metadata: {
        timestamp: Date.now(),
        correlationId: options.correlationId || uuidv4(),
        ...options.headers
      }
    };

    // Set default message options
    const messageOptions: amqp.Options.Publish = {
      persistent: true,
      ...options,
      contentType: 'application/json',
      correlationId: payload.metadata.correlationId
    };

    // Convert payload to buffer
    const buffer = Buffer.from(JSON.stringify(payload));

    try {
      return this.channel.publish(exchange, routingKey, buffer, messageOptions);
    } catch (error) {
      console.error(`Failed to publish message to ${exchange} with key ${routingKey}:`, error);
      throw error;
    }
  }

  /**
   * Publish a message using a predefined routing key from config
   */
  public async publishByType(
    category: string,
    type: string,
    message: any,
    options: amqp.Options.Publish = {}
  ): Promise<boolean> {
    if (!this.config.routingKeys[category] || !this.config.routingKeys[category][type]) {
      throw new Error(`Routing key for ${category}.${type} not found in configuration`);
    }

    const routingKey = this.config.routingKeys[category][type];
    const exchange = this.config.exchanges[category]?.name;

    if (!exchange) {
      throw new Error(`Exchange for category ${category} not found in configuration`);
    }

    return this.publish(exchange, routingKey, message, options);
  }

  /**
   * Consume messages from a queue
   */
  public async consume(
    queueName: string,
    handler: MessageHandler,
    options: ConsumeOptions = { noAck: false }
  ): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    // Find the queue configuration
    const queueConfig = Object.values(this.config.queues).find(
      (q) => q.name === queueName
    ) || { name: queueName, options: { durable: true } };

    // Assert queue if it doesn't exist yet 
    await this.channel.assertQueue(queueConfig.name, queueConfig.options);

    // Process messages
    const { consumerTag } = await this.channel.consume(
      queueName,
      async (msg: ConsumeMessage | null) => {
        if (!msg) {
          return;
        }

        try {
          const contentType = msg.properties.contentType;
          const isJson = contentType === 'application/json' || msg.content.toString().startsWith('{');
          
          let payload: MessagePayload;
          
          // Parse message content based on content type
          if (isJson) {
            payload = JSON.parse(msg.content.toString());
          } else {
            // Create a payload structure for non-JSON messages
            payload = {
              data: msg.content.toString(),
              metadata: {
                timestamp: Date.now(),
                correlationId: msg.properties.correlationId,
                ...msg.properties.headers
              }
            };
          }

          // Process the message with the handler
          await Promise.resolve(handler(payload));

          // Acknowledge the message if noAck is false
          if (!options.noAck && this.channel) {
            this.channel.ack(msg);
          }
        } catch (error) {
          console.error(`Error processing message from queue ${queueName}:`, error);
          
          // Reject the message and requeue it if there was an error
          if (!options.noAck && this.channel) {
            this.channel.nack(msg, false, true);
          }
        }
      },
      options
    );

    // Store consumer information for cancellation
    this.consumers.set(queueName, { consumerTag });
    console.log(`Consumer started for queue ${queueName}`);
    
    return consumerTag;
  }

  /**
   * Cancel consumption of messages from a queue
   */
  public async cancelConsume(queueName: string): Promise<void> {
    if (!this.initialized || !this.channel) {
      return;
    }

    const consumer = this.consumers.get(queueName);
    if (consumer) {
      await this.channel.cancel(consumer.consumerTag);
      this.consumers.delete(queueName);
      console.log(`Consumer canceled for queue ${queueName}`);
    }
  }

  /**
   * Close the connection to RabbitMQ
   */
  public async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }

    if (this.connection) {
    //  await this.connection.close();
      this.connection = null;
    }

    this.initialized = false;
    console.log('Message broker closed');
  }

  /**
   * Handle reconnection to RabbitMQ
   */
  private async reconnect(): Promise<void> {
    if (this.connection || this.channel) {
      // Clean up existing connections
      try {
        if (this.channel) {
          await this.channel.close();
        }
        if (this.connection) {
      //    await this.connection.close();
        }
      } catch (error) {
        // Ignore errors during cleanup
      }
      
      this.channel = null;
      this.connection = null;
      this.initialized = false;
    }

    // Wait before reconnecting
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Try to initialize again
    try {
      await this.initialize();
      console.log('Successfully reconnected to RabbitMQ');
    } catch (error) {
      console.error('Failed to reconnect to RabbitMQ:', error);
      this.reconnect();
    }
  }
}

// Singleton instance
let brokerInstance: MessageBroker | null = null;

/**
 * Get the message broker singleton instance
 */
export function getBroker(): MessageBroker {
  if (!brokerInstance) {
    brokerInstance = new MessageBroker();
  }
  return brokerInstance;
}