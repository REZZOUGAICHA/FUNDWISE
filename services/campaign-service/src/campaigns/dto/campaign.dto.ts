export interface CreateCampaignDto {
  title: string;
  description: string;
  target_amount: number;
  end_date: string;
  organization_id: string;
}

export interface ProofSubmissionDto {
  description: string;
  amountUsed: number;
  submittedBy: string;
}
