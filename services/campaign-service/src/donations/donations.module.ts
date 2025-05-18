import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DonationConsumer } from './donation.consumer';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
  ],
  providers: [DonationConsumer],
  exports: [DonationConsumer],
})
export class DonationsModule {} 