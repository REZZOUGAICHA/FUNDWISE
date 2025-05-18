import { registerAs } from '@nestjs/config';

export default registerAs('blockchain', () => ({
  // Network configuration
  network: process.env.BLOCKCHAIN_NETWORK || 'localhost',
  rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545',
  
  // Contract addresses
  contracts: {
    campaignManager: process.env.CAMPAIGN_MANAGER_ADDRESS || '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    donationManager: process.env.DONATION_MANAGER_ADDRESS || '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
    fundReleaseManager: process.env.FUND_RELEASE_MANAGER_ADDRESS || '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
    proofStorage: process.env.PROOF_STORAGE_ADDRESS || '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
    mockToken: process.env.MOCK_TOKEN_ADDRESS || '0x0165878A594ca255338adfa4d48449f69242Eb8F',
  },
  
  // IPFS configuration
  ipfs: {
    pinataApiKey: process.env.PINATA_API_KEY || '55dd55af7d1d95928906',
    pinataSecretKey: process.env.PINATA_SECRET_KEY || '1eeb7aae9df227f971f923d685e48ca081941c9c87a91315221783cc4124cd6a',
  },
  
  // Wallet configuration - In production, use secure vault or env variables
  admin: {
    privateKey: process.env.ADMIN_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // Default Hardhat account #0
  },
}));