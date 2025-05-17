import { Module } from '@nestjs/common';
import { TransactionService } from './services/transaction/transaction.service';
import { EventListenerService } from './services/event-listener/event-listener.service';
import { WalletManagementService } from './services/wallet-management/wallet-management.service';


@Module({
  providers: [
    TransactionService,
    EventListenerService,
    WalletManagementService,
  ],
  exports: [
    TransactionService,
    EventListenerService,
    WalletManagementService,
  ],
})
export class BlockchainIntegrationLayerModule {}
