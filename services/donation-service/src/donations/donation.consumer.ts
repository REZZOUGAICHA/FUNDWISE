import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { DonationEvent } from './interfaces/donation.interface';

@Injectable()
export class DonationConsumer implements OnModuleInit {
  private readonly logger = new Logger(DonationConsumer.name);
  private client: ClientProxy;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
        queue: 'donation.created',
        queueOptions: {
          durable: true,
          arguments: {
            'x-message-deduplication': true,
            'x-message-ttl': 86400000 // 24 hours in milliseconds
          }
        },
        noAck: false,
        prefetchCount: 1,
        exchange: 'donation_exchange',
        routingKey: 'donation.created',
      },
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.client.emit('donation.created', this.handleDonationCreated.bind(this));
      this.logger.log('Donation consumer initialized');
    } catch (error) {
      this.logger.error('Failed to initialize donation consumer:', error);
      throw error;
    }
  }

  private async handleDonationCreated(message: DonationEvent) {
    try {
      this.logger.debug(`Received donation created event: ${JSON.stringify(message)}`);

      const { data } = message;
      const { campaign_id, amount, donor_id, transaction_id } = data;

      // Create donation record
      const donation = await this.prisma.donation.create({
        data: {
          campaign_id,
          donor_id,
          amount,
          transaction_id,
          status: 'completed',
          created_at: new Date()
        }
      });

      this.logger.log(`Successfully processed donation ${donation.id}`);
    } catch (error) {
      this.logger.error(`Error processing donation: ${error.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.client.close();
  }
} 