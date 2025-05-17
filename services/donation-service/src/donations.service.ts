import { Injectable } from '@nestjs/common';
import { CreateDonationDto } from './create-donation.dto';
import { DonorTransactionsRepository } from './donor-transactions/donor-transactions.repository';
import { PublicDonationStatsRepository } from './public-donation-stats/public-donation-stats.repository';
import { TransactionDetailsRepository } from './transaction-details/transaction-details.repository';
import { BrokerService } from './broker.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DonationsService {
  constructor(
    private readonly donorTransactionsRepository: DonorTransactionsRepository,
    private readonly publicDonationStatsRepository: PublicDonationStatsRepository,
    private readonly transactionDetailsRepository: TransactionDetailsRepository,
    private readonly brokerService: BrokerService,
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

    // Prepare donation event payload
    const donationEvent = {
      transaction_id: transactionId,
      donor_id: createDonationDto.donor_id,
      campaign_id: createDonationDto.campaign_id,
      amount: createDonationDto.amount,
      payment_method: createDonationDto.payment_method,
      status: 'pending',
      timestamp: new Date().toISOString(),
      details_id: (donorTransaction as any).details?.id,
    };

    try {
      // Publish donation created event to the message broker
      await this.brokerService.publish('donation.created', donationEvent);
      console.log(`Published donation event for transaction ${transactionId}`);
    } catch (error) {
      console.error('Failed to publish donation event:', error);
      // Note: We're continuing even if publishing fails to not block the donation process
      // In production, you might want to implement a retry mechanism or queue
    }
 
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