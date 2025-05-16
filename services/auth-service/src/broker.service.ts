import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
//import brokerclien from 'C:/Fundwise/FUNDWISE/message-broker/src/lib/broker-clien'; // adjust path
export const BrokerClient = require('C:/Fundwise/FUNDWISE/message-broker/src/lib/broker-client');

@Injectable()
export class BrokerService implements OnModuleInit, OnModuleDestroy {
  private client: any;

  constructor() {
    this.client = new BrokerClient('auth'); // 'auth' is the service name in your config
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async publish(routingKey: string, message: any) {
    return this.client.publishMessage(routingKey, message);
  }

  async consume(queue: string, handler: (msg: any) => Promise<void>) {
    return this.client.consume(queue, handler);
  }

  async onModuleDestroy() {
    await this.client.close();
  }
}
