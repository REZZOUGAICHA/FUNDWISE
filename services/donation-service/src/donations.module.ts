import { Module } from '@nestjs/common';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { DonorTransactionsModule } from './donor-transactions/donor-transactions.module';
import { PublicDonationStatsModule } from './public-donation-stats/public-donation-stats.module';
import { TransactionDetailsModule } from './transaction-details/transaction-details.module';
import { BrokerModule } from './broker.module';
import { DonationEventsController } from './donation-events.controller';

@Module({
  imports: [
    DonorTransactionsModule,
    PublicDonationStatsModule,
    TransactionDetailsModule,
    BrokerModule,
  ],
  controllers: [DonationsController, DonationEventsController],
  providers: [DonationsService],
})
export class DonationsModule {}