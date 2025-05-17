import { registerAs } from '@nestjs/config';

export default registerAs('blockchain', () => ({
  // Network configuration
  network: process.env.BLOCKCHAIN_NETWORK || 'localhost',
  rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545',
  
  // Contract addresses
  contracts: {
    campaignManager: process.env.CAMPAIGN_MANAGER_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    donationManager: process.env.DONATION_MANAGER_ADDRESS || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    fundReleaseManager: process.env.FUND_RELEASE_MANAGER_ADDRESS || '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    proofStorage: process.env.PROOF_STORAGE_ADDRESS || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    mockToken: process.env.MOCK_TOKEN_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
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