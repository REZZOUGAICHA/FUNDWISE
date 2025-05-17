// src/campaigns/campaign.module.ts
import { Module } from '@nestjs/common';
import { CampaignController } from './campaigns.controller';
import { CampaignService } from './campaigns.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { IpfsModule } from '../ipfs/ipfs.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    IpfsModule,
    ClientsModule.registerAsync([
      {
        name: 'VERIFICATION_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          // Check if we're in test mode
          const isTestMode = process.env.NODE_ENV === 'test';
          
          if (isTestMode) {
            // Return a mock implementation for testing
            return {
              emit: (pattern: string, data: any) => {
                console.log(`Mock emitting ${pattern} with data:`, data);
                return { pipe: () => ({}) };
              }
            };
          }
          
          // Return the real RabbitMQ implementation for production
          return {
            transport: Transport.RMQ,
            options: {
              urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672'],
              queue: 'verification_queue',
              queueOptions: {
                durable: true,
              },
            },
          };
        },
      },
    ]),
  ],
  controllers: [CampaignController],
  providers: [CampaignService],
  exports: [CampaignService],
})
export class CampaignModule {}
