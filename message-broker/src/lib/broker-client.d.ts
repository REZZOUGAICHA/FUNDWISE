// broker-client.d.ts

import { Options, Connection, Channel, ConsumeMessage } from 'amqplib';

declare module 'path-to-broker-client' {
  export default class BrokerClient {
    private serviceName: string;
    private connection: Connection | null;
    private channel: Channel | null;
    private initialized: boolean;

    constructor(serviceName: string);

    connect(): Promise<void>;

    publishMessage(
      routingKey: string,
      message: unknown,
      options?: Options.Publish
    ): Promise<void>;

    consume(
      queueName: string,
      handler: (message: any) => Promise<void>,
      options?: Options.AssertQueue
    ): Promise<void>;

    close(): Promise<void>;
  }
}
