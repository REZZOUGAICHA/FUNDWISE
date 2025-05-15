// services/campaign-service/src/types/campaign.types.ts
export interface CreateCampaignDto {
  title: string;
  description: string;
  target_amount: number;
  end_date: string; // Standardize on string
  organization_id: string;
}


export interface ProofSubmissionDto {
  description: string;
  amountUsed: number;
  submittedBy: string;
  // Add other fields as needed
}
