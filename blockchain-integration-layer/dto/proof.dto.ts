export class SubmitProofDto {
    campaignId: number;
    ipfsHash: string;
    description: string;
    amount: string; // BigNumber as string
  }
  
  export class SetProofStatusDto {
    proofId: string; // bytes32 hash as string
    status: number;
  }
  
  export interface ProofDto {
    id: string;
    campaignId: number;
    ipfsHash: string;
    description: string;
    amount: string;
    status: number;
    submitter: string;
    timestamp: number;
  }