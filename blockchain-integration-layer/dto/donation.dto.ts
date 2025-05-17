// DTO objects for donation-related data

export class DonationDto {
    id?: number;
    campaignId: number;
    donorAddress: string;
    amount: string; // Use string for large numbers
    timestamp: Date;
    
    // Blockchain-specific metadata
    transactionHash?: string;
    blockNumber?: number;
  }
  
  export class DonationReceivedEventDto {
    campaignId: string;
    donorAddress: string;
    amount: string;
    blockchainTxHash: string;
    blockNumber: number;
    timestamp: number;
  }
  
  export class CreateDonationDto {
    campaignId: number;
    amount: string;
    donorAddress?: string; // Optional if using authenticated user
  }