
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