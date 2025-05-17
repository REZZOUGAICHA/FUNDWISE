import { Channel, Connection, Options } from 'amqplib';

export interface ExchangeConfig {
  name: string;
  type: string;
  options: Options.AssertExchange;
}

export interface QueueConfig {
  name: string;
  exchange: string;
  bindingKey: string;
  options: Options.AssertQueue;
}

export interface RabbitMQConfig {
  connection: string;
  exchanges: {
    [key: string]: ExchangeConfig;
  };
  queues: {
    [key: string]: QueueConfig;
  };
  routingKeys: {
    [category: string]: {
      [key: string]: string;
    };
  };
}

export interface MessagePayload {
  data: any;
  metadata: {
    timestamp: number;
    correlationId?: string;
    userId?: string;
    [key: string]: any;
  };
}

export type MessageHandler = (message: MessagePayload) => Promise<void> | void;

export interface ConsumeOptions {
  noAck?: boolean;
  exclusive?: boolean;
}