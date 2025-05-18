import { Module } from '@nestjs/common';
import { TransactionDetailsRepository } from './transaction-details.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TransactionDetailsRepository],
  exports: [TransactionDetailsRepository],
})
export class TransactionDetailsModule {}