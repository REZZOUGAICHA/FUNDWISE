import { Module } from '@nestjs/common';
import { DonorTransactionsRepository } from './donor-transactions.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DonorTransactionsRepository],
  exports: [DonorTransactionsRepository],
})
export class DonorTransactionsModule {}