// blockchain-integration-layer/test/donation.spec.ts

import { EventEmitter2 } from '@nestjs/event-emitter';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// Import your actual services
import { WalletManagementService } from '../services/wallet-management/wallet-management.service';
import { TransactionService } from '../services/transaction/transaction.service';
import { ConfigService } from '@nestjs/config';

// Default test timeout
const DEFAULT_TIMEOUT = 120000; // 120 seconds

// Mock config service similar to your campaign creation test
class MockConfigService {
  get(key: string) {
    if (key === 'blockchain.rpcUrl') return 'http://127.0.0.1:8545';
    if (key === 'blockchain.admin.privateKey') return '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    if (key === 'blockchain.contracts.campaignManager') {
      return '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853';
    }
    if (key === 'blockchain.contracts.donationManager') {
      return '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
    }
    if (key === 'blockchain.contracts.fundReleaseManager') {
      return '0x610178dA211FEF7D417bC0e6FeD39F05609AD788';
    }
    if (key === 'blockchain.contracts.proofStorage') {
      return '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6';
    }
    if (key === 'blockchain.contracts.mockToken') {
      return '0x0165878A594ca255338adfa4d48449f69242Eb8F';
    }
    
    return null;
  }
}

describe('Campaign Donation Integration', () => {
  let transactionService: TransactionService;
  let walletService: WalletManagementService;
  let eventEmitter: EventEmitter2;
  let configService: ConfigService;
  
  // Wallets
  let adminWallet: ethers.Wallet;
  let ngoWallet: ethers.Wallet;
  let donorWallet: ethers.Wallet;
  
  let campaignId: number;

  // Helper for writing JSON logs
  function appendJson(filename: string, data: any) {
    const outputDir = path.resolve(__dirname, 'output');
    const outputFile = path.join(outputDir, filename);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    let arr: any[] = [];
    if (fs.existsSync(outputFile)) {
      try {
        arr = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
        if (!Array.isArray(arr)) arr = [];
      } catch {
        arr = [];
      }
    }
    arr.push(data);
    fs.writeFileSync(outputFile, JSON.stringify(arr, null, 2));
  }

  beforeAll(async () => {
    // Create event emitter
    eventEmitter = new EventEmitter2({
      wildcard: true,
      delimiter: ':',
      maxListeners: 20,
      verboseMemoryLeak: true,
    });
    
    configService = new MockConfigService() as unknown as ConfigService;
    
    // Create our services
    walletService = new WalletManagementService(configService);
    transactionService = new TransactionService(walletService, configService, eventEmitter);

    // Set up admin wallet
    adminWallet = walletService.getAdminWallet();
    const provider = walletService.getProvider();
    
    // Create NGO wallet with some initial balance
    ngoWallet = ethers.Wallet.createRandom().connect(provider);
    
    // Create donor wallet with some initial balance
    donorWallet = ethers.Wallet.createRandom().connect(provider);
    
    // Import wallets into our service
    walletService.importWallet(ngoWallet.privateKey);
    walletService.importWallet(donorWallet.privateKey);

    console.log(`Admin wallet initialized: ${adminWallet.address}`);
    console.log(`NGO wallet generated: ${ngoWallet.address}`);
    console.log(`Donor wallet generated: ${donorWallet.address}`);
    
    // Send some ETH to both wallets from admin
    await adminWallet.sendTransaction({
      to: ngoWallet.address,
      value: ethers.utils.parseEther("1.0") // Send 1 ETH
    });
    
    await adminWallet.sendTransaction({
      to: donorWallet.address,
      value: ethers.utils.parseEther("1.0") // Send 1 ETH
    });
    
    // Mint some USDT for donor wallet
    await transactionService.executeTransaction({
      contractName: 'MockToken',
      method: 'mint',
      params: [donorWallet.address, ethers.utils.parseUnits('1000', 6).toString()],
      from: adminWallet.address
    });
    
    // Wait a bit for the transactions to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  }, DEFAULT_TIMEOUT);

  it('should create, verify, activate campaign and donate, logging to JSON', async () => {
    // 1. Create Campaign
    const createTx = await transactionService.executeTransaction({
      contractName: 'CampaignManager',
      method: 'createCampaign',
      params: [
        'Test Campaign',
        'Test Description',
        ethers.utils.parseUnits('1000', 6).toString(),
        7
      ],
      from: ngoWallet.address
    });
    expect(createTx.success).toBeTruthy();

    // Extract campaign ID from transaction logs or events
    const receipt = createTx.receipt;
    
    // Try to get campaignId from events
    let eventFound = false;
    
    // Listen for campaign creation event
    eventEmitter.on('CampaignManager:CampaignCreated', (eventData) => {
      console.log('🎯 CampaignCreated event received:', eventData);
      eventFound = true;
      campaignId = parseInt(eventData.returnValues.campaignId, 10);
    });
    
    // Check transaction receipt for logs
    if (receipt && receipt.events) {
      const campaignCreatedEvent = receipt.events.find(
        (e: any) => e.event === 'CampaignCreated'
      );
      
      if (campaignCreatedEvent && campaignCreatedEvent.args) {
        campaignId = campaignCreatedEvent.args.campaignId?.toNumber() || 
                    parseInt(campaignCreatedEvent.args.campaignId, 10) || 1;
      }
    }
    
    // If we still don't have a campaign ID, default to 1
    if (!campaignId) {
      console.warn('⚠️ Could not extract campaign ID from events, using default ID of 1');
      campaignId = 1;
    }
    
    console.log(`Campaign created with ID: ${campaignId}`);
    
    // Wait for a bit to allow event processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Log campaign creation to JSON
    appendJson('campaigns.json', {
      campaignId,
      ngo: ngoWallet.address,
      title: 'meriem and maroua Campaign',
      fundingGoal: ethers.utils.parseUnits('1000', 6).toString(),
      transactionHash: createTx.transactionHash,
      blockNumber: receipt?.blockNumber || 0
    });

    // 2. Verify Campaign (admin is verifier)
    const verifyTx = await transactionService.executeTransaction({
      contractName: 'CampaignManager',
      method: 'verifyCampaign',
      params: [campaignId],
      from: adminWallet.address
    });
    expect(verifyTx.success).toBeTruthy();
    console.log(`Campaign ${campaignId} verified`);

    // 3. Activate Campaign
    const activateTx = await transactionService.executeTransaction({
      contractName: 'CampaignManager',
      method: 'activateCampaign',
      params: [campaignId],
      from: adminWallet.address
    });
    expect(activateTx.success).toBeTruthy();
    console.log(`Campaign ${campaignId} activated`);

    // 4. Approve USDT for donation
    const donationAmount = ethers.utils.parseUnits('100', 6).toString();
    const donationManagerAddress = configService.get('blockchain.contracts.donationManager');
    
    const approveTx = await transactionService.executeTransaction({
      contractName: 'MockToken',
      method: 'approve',
      params: [donationManagerAddress, donationAmount],
      from: donorWallet.address
    });
    expect(approveTx.success).toBeTruthy();
    console.log(`Approved ${donationAmount} tokens for donation`);

    // 5. Donate to Campaign
    const donateTx = await transactionService.executeTransaction({
      contractName: 'DonationManager',
      method: 'donate',
      params: [campaignId, donationAmount],
      from: donorWallet.address
    });
    expect(donateTx.success).toBeTruthy();
    console.log(`Successfully donated to campaign ${campaignId}`);

    // Log donation to JSON
    appendJson('donations.json', {
      campaignId,
      donor: donorWallet.address,
      amount: donationAmount,
      transactionHash: donateTx.transactionHash,
      blockNumber: donateTx.receipt?.blockNumber || 0
    });
  }, DEFAULT_TIMEOUT);

  afterAll(async () => {
    // Clean up event listeners
    if (transactionService) {
      transactionService.cleanupEventListeners();
    }
    eventEmitter.removeAllListeners();
    console.log('Event listeners cleaned up');

    // Allow time for any pending operations to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
  });
});