export class ApproveProofDto {
    proofId?: string; // bytes32 hash as string
  }
  
  export class RejectProofDto {
    proofId?: string; // bytes32 hash as string
    reason?: string;
  }
  
  export interface FundReleaseDto {
    campaignId: number;
    proofId: string;
    amount: string;
    timestamp: number;
  }