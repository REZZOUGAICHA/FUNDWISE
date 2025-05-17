// DTO objects for campaign-related data

export class CampaignDto {
    id: number;
    ngoAddress: string;
    title: string;
    description: string;
    fundingGoal: string; // Use string for large numbers
    deadline: Date;
    verified: boolean;
    active: boolean;
    createdAt: Date;
    
    // Blockchain-specific metadata
    transactionHash?: string;
    blockNumber?: number;
  }
  
  export class CampaignCreatedEventDto {
    campaignId: string;
    ngoAddress: string;
    title: string;
    fundingGoal: string;
    blockchainTxHash: string;
    blockNumber: number;
    timestamp: number;
  }
  
  export class CampaignVerifiedEventDto {
    campaignId: string;
    verifierAddress: string;
    blockchainTxHash: string;
    blockNumber: number;
    timestamp: number;
  }
  
  export class CampaignStatusChangedEventDto {
    campaignId: string;
    isActive: boolean;
    blockchainTxHash: string;
    blockNumber: number;
    timestamp: number;
  }
  
  export class CreateCampaignDto {
    title: string;
    description: string;
    fundingGoal: string;
    durationInDays: number;
    ngoAddress?: string; // Optional if using authenticated user
  }