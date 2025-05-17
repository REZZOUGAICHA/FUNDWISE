// rabbitmq.config.d.ts

export interface RabbitMQConnectionConfig {
  protocol?: string;
  hostname?: string;
  port?: number;
  username?: string;
  password?: string;
  vhost?: string;
  connectionTimeout?: number;
  heartbeat?: number;
}

export interface ExchangeConfig {
  name: string;
  type: string;
  options?: Record<string, any>;
}

export interface QueueConfig {
  name: string;
  options?: Record<string, any>;
  bindingKey?: string;
  exchange?: string;
}

export interface RabbitMQConfig {
  connection: RabbitMQConnectionConfig;
  exchanges: Record<string, ExchangeConfig>;
  queues: Record<string, QueueConfig>;
  publishDefaults?: Record<string, any>;
  consumeDefaults?: Record<string, any>;
}

declare const config: RabbitMQConfig;

export default config;
