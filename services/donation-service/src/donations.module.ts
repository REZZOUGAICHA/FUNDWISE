import { Module } from '@nestjs/common';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { DonorTransactionsModule } from './donor-transactions/donor-transactions.module';
import { PublicDonationStatsModule } from './public-donation-stats/public-donation-stats.module';
import { TransactionDetailsModule } from './transaction-details/transaction-details.module';

@Module({
  imports: [
    DonorTransactionsModule,
    PublicDonationStatsModule,
    TransactionDetailsModule,
  ],
  controllers: [DonationsController],
  providers: [DonationsService],
})
export class DonationsModule {}