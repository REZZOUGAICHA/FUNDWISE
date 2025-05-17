export interface BlockchainEvent {
  contractName: string;
  eventName: string;
  transactionHash: string;
  blockNumber: number;
  returnValues: any;
  timestamp: number;
}

export interface EventSubscription {
  contractName: string;
  eventName: string;
  callback: (event: BlockchainEvent) => void;
  filter?: any;
}

export interface EventFilter {
  fromBlock?: number | string;
  toBlock?: number | string;
  address?: string;
  topics?: string[];
}

export interface Wallet {
  address: string;
  privateKey: string;
}

export interface WalletGenerationOptions {
  mnemonic?: string;
  path?: string;
  index?: number;
}

export interface SignedTransaction {
  messageHash: string;
  r: string;
  s: string;
  v: string;
  rawTransaction: string;
  transactionHash: string;
}

export interface TransactionRequest {
  contractName: 'CampaignManager' | 'DonationManager' | 'FundReleaseManager' | 'ProofStorage' | 'MockToken';
  method: string;
  params: any[];
  from?: string;
  value?: string;
  gasLimit?: string;
}

export interface TransactionResponse {
  success: boolean;
  transactionHash?: string;
  blockNumber?: number;
  receipt?: any;
  error?: string;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  receipt?: any;
}