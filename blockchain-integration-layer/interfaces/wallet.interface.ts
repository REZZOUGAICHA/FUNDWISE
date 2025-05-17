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