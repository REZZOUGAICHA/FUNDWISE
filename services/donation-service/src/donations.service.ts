import { Injectable } from '@nestjs/common';
import { CreateDonationDto } from './create-donation.dto';
import { DonorTransactionsRepository } from './donor-transactions/donor-transactions.repository';
import { PublicDonationStatsRepository } from './public-donation-stats/public-donation-stats.repository';
import { TransactionDetailsRepository } from './transaction-details/transaction-details.repository';
import { donor_transactions } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DonationsService {
  constructor(
    private readonly donorTransactionsRepository: DonorTransactionsRepository,
    private readonly publicDonationStatsRepository: PublicDonationStatsRepository,
    private readonly transactionDetailsRepository: TransactionDetailsRepository,
  ) {}

  async createDonation(createDonationDto: CreateDonationDto) {
    // Generate unique transaction ID
    const transactionId = this.generateUniqueId();

    // Create donor transaction record
    const donorTransaction = await this.donorTransactionsRepository.create({
      donor_id: createDonationDto.donor_id,
      transaction_id: transactionId,
      details: {
        amount: createDonationDto.amount,
        campaign_id: createDonationDto.campaign_id,
        transaction_hash: createDonationDto.transaction_hash,
        payment_method: createDonationDto.payment_method,
        message: createDonationDto.message,
        encrypted_amount: createDonationDto.encrypted_amount,
        status: 'pending',
      }
    });

    // Create public stats record (without donor information)
    await this.publicDonationStatsRepository.create({
      campaign_id: createDonationDto.campaign_id,
      amount: createDonationDto.amount,
    });

    return {
      success: true,
      transaction_id: transactionId,
      details_id: (donorTransaction as any).details?.id,
    };
  }

  private generateUniqueId(): string {
    return uuidv4();
  }
}