import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { TransactionService } from './transaction.service';
import { WalletManagementService } from '../wallet-management/wallet-management.service';
import { ethers } from 'ethers';
import { Logger } from '@nestjs/common';

describe('Blockchain Integration Tests', () => {
  let walletService: WalletManagementService;
  let transactionService: TransactionService;
  let eventEmitter: EventEmitter2;

  // Test accounts
  let adminWallet: ethers.Wallet;
  let ngoWallet: ethers.Wallet;
  let donorWallet: ethers.Wallet;
  let verifierWallet: ethers.Wallet;

  // Test data
  const CAMPAIGN_TITLE = 'Clean Water Project';
  const CAMPAIGN_DESC = 'Provide clean water to rural communities';
  const FUNDING_GOAL = ethers.utils.parseUnits('10000', 6); // 10,000 USDT
  const DURATION_DAYS = 30;
  const DONATION_AMOUNT = ethers.utils.parseUnits('6000', 6); // 6,000 USDT
  const IPFS_HASH_1 = 'QmHash1';
  const IPFS_HASH_2 = 'QmHash2';
  const IPFS_HASH_3 = 'QmHash3';

  // Response tracking
  let campaignId: string;
  let proofId: string;

  beforeAll(async () => {
    // Create mock ConfigService
    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'blockchain.rpcUrl') return 'http://127.0.0.1:8545';
        if (key === 'blockchain.admin.privateKey') return '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        return undefined;
      }),
    };

    // Create EventEmitter
    eventEmitter = new EventEmitter2({
      // Configure to make testing easier
      wildcard: true,
      delimiter: ':',
      maxListeners: 20,
      verboseMemoryLeak: true,
    });

    // Create the module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletManagementService,
        TransactionService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitter,
        },
      ],
    }).compile();

    // Get service instances
    walletService = module.get<WalletManagementService>(WalletManagementService);
    transactionService = module.get<TransactionService>(TransactionService);

    // Set up test wallets
    adminWallet = walletService.getAdminWallet();
    const provider = walletService.getProvider();

    // Create test wallets
    // Generate and fund NGO wallet
    const ngoWalletInfo = walletService.generateWallet();
    ngoWallet = new ethers.Wallet(ngoWalletInfo.privateKey, provider);
    
    // Generate and fund donor wallet
    const donorWalletInfo = walletService.generateWallet();
    donorWallet = new ethers.Wallet(donorWalletInfo.privateKey, provider);
    
    // Generate and fund verifier wallet
    const verifierWalletInfo = walletService.generateWallet();
    verifierWallet = new ethers.Wallet(verifierWalletInfo.privateKey, provider);

    console.log(`Admin wallet address: ${adminWallet.address}`);
    console.log(`NGO wallet address: ${ngoWallet.address}`);
    console.log(`Donor wallet address: ${donorWallet.address}`);
    console.log(`Verifier wallet address: ${verifierWallet.address}`);

    // Fund the wallets with ETH from the admin (hardhat default account)
    await fundWallet(adminWallet, ngoWallet.address, '1.0');
    await fundWallet(adminWallet, donorWallet.address, '1.0');
    await fundWallet(adminWallet, verifierWallet.address, '1.0');
  });

  // Helper function to fund wallets
  async function fundWallet(from: ethers.Wallet, to: string, amount: string) {
    const tx = await from.sendTransaction({
      to,
      value: ethers.utils.parseEther(amount),
    });
    await tx.wait();
    console.log(`Funded ${to} with ${amount} ETH, tx: ${tx.hash}`);
  }

  describe('Setup Flow', () => {
    it('Sets up roles and permissions', async () => {
      // Add verifier to CampaignManager
      const addVerifierTx = {
        contractName: 'CampaignManager',
        method: 'addVerifier',
        params: [verifierWallet.address],
        from: adminWallet.address,
      };

      const addVerifierResult = await transactionService.executeTransaction(addVerifierTx);
      expect(addVerifierResult.success).toBe(true);
      console.log(`Verifier added, tx hash: ${addVerifierResult.transactionHash}`);

      // Add verifier as validator to ProofStorage
      const addValidatorTx = {
        contractName: 'ProofStorage',
        method: 'addValidator',
        params: [verifierWallet.address],
        from: adminWallet.address,
      };

      const addValidatorResult = await transactionService.executeTransaction(addValidatorTx);
      expect(addValidatorResult.success).toBe(true);
      console.log(`Validator added, tx hash: ${addValidatorResult.transactionHash}`);

      // Approve FundReleaseManager in DonationManager
      const mockFundManagerAddress = transactionService.getContract('FundReleaseManager')?.address;
      
      const approveFundManagerTx = {
        contractName: 'DonationManager',
        method: 'approveFundReleaseManager',
        params: [mockFundManagerAddress],
        from: adminWallet.address,
      };

      const approveFundManagerResult = await transactionService.executeTransaction(approveFundManagerTx);
      expect(approveFundManagerResult.success).toBe(true);
      console.log(`FundReleaseManager approved, tx hash: ${approveFundManagerResult.transactionHash}`);

      // Fund donor with mock USDT tokens
      const mintTokensTx = {
        contractName: 'MockToken',
        method: 'mint',
        params: [donorWallet.address, DONATION_AMOUNT.toString()],
        from: adminWallet.address,
      };

      const mintTokensResult = await transactionService.executeTransaction(mintTokensTx);
      expect(mintTokensResult.success).toBe(true);
      console.log(`Minted ${ethers.utils.formatUnits(DONATION_AMOUNT, 6)} tokens to donor`);
    });
  });

  describe('Campaign Creation and Activation', () => {
    it('NGO creates a campaign', async () => {
      // Setup event listener
      const campaignCreatedPromise = new Promise<string>((resolve) => {
        eventEmitter.once('CampaignManager:CampaignCreated', (event) => {
          resolve(event.returnValues.campaignId);
        });
      });

      // Create a campaign transaction
      const createCampaignTx = {
        contractName: 'CampaignManager',
        method: 'createCampaign',
        params: [
          CAMPAIGN_TITLE,
          CAMPAIGN_DESC,
          FUNDING_GOAL.toString(),
          DURATION_DAYS,
        ],
        from: ngoWallet.address,
      };

      const createCampaignResult = await transactionService.executeTransaction(createCampaignTx);
      expect(createCampaignResult.success).toBe(true);
      console.log(`Campaign created, tx hash: ${createCampaignResult.transactionHash}`);
      
      // Wait for the event to get the campaign ID
      campaignId = await campaignCreatedPromise;
      console.log(`Campaign ID: ${campaignId}`);
      expect(campaignId).toBeTruthy();
    });

    it('Verifier verifies and activates the campaign', async () => {
      // Setup event listener for status change
      const campaignStatusChangePromise = new Promise<boolean>((resolve) => {
        eventEmitter.once('campaign.status-changed', (event) => {
          resolve(event.isActive);
        });
      });

      // Verify campaign transaction
      const verifyCampaignTx = {
        contractName: 'CampaignManager',
        method: 'verifyCampaign',
        params: [campaignId],
        from: verifierWallet.address,
      };

      const verifyCampaignResult = await transactionService.executeTransaction(verifyCampaignTx);
      expect(verifyCampaignResult.success).toBe(true);
      console.log(`Campaign verified, tx hash: ${verifyCampaignResult.transactionHash}`);

      // Activate campaign transaction
      const activateCampaignTx = {
        contractName: 'CampaignManager',
        method: 'activateCampaign',
        params: [campaignId],
        from: verifierWallet.address,
      };

      const activateCampaignResult = await transactionService.executeTransaction(activateCampaignTx);
      expect(activateCampaignResult.success).toBe(true);
      console.log(`Campaign activated, tx hash: ${activateCampaignResult.transactionHash}`);

      // Wait for the campaign status change event
      const isActive = await campaignStatusChangePromise;
      expect(isActive).toBe(true);
    });
  });

  describe('Donation Flow', () => {
    it('Donor approves and donates to the campaign', async () => {
      // Setup event listener for donation
      const donationReceivedPromise = new Promise<any>((resolve) => {
        eventEmitter.once('DonationManager:DonationReceived', (event) => {
          resolve(event.returnValues);
        });
      });

      // Get donation manager contract address
      const donationManagerAddress = transactionService.getContract('DonationManager')?.address;

      // Approve tokens for DonationManager
      const approveTokensTx = {
        contractName: 'MockToken',
        method: 'approve',
        params: [
          donationManagerAddress,
          DONATION_AMOUNT.toString(),
        ],
        from: donorWallet.address,
      };

      const approveTokensResult = await transactionService.executeTransaction(approveTokensTx);
      expect(approveTokensResult.success).toBe(true);
      console.log(`Tokens approved for donation, tx hash: ${approveTokensResult.transactionHash}`);

      // Make donation transaction
      const donateTx = {
        contractName: 'DonationManager',
        method: 'donate',
        params: [campaignId, DONATION_AMOUNT.toString()],
        from: donorWallet.address,
      };

      const donateResult = await transactionService.executeTransaction(donateTx);
      expect(donateResult.success).toBe(true);
      console.log(`Donation made, tx hash: ${donateResult.transactionHash}`);

      // Wait for the donation event
      const donationEvent = await donationReceivedPromise;
      expect(donationEvent.campaignId.toString()).toBe(campaignId.toString());
      expect(donationEvent.donor.toLowerCase()).toBe(donorWallet.address.toLowerCase());
      expect(donationEvent.amount.toString()).toBe(DONATION_AMOUNT.toString());
    });
  });

  describe('First Milestone Flow', () => {
    it('NGO submits proof for first milestone release', async () => {
      // Setup event listener for proof submission
      const proofSubmittedPromise = new Promise<any>((resolve) => {
        eventEmitter.once('ProofStorage:ProofSubmitted', (event) => {
          resolve(event.returnValues);
        });
      });

      // Submit proof transaction
      const firstReleaseAmount = ethers.utils.parseUnits('3000', 6);
      const submitProofTx = {
        contractName: 'ProofStorage',
        method: 'submitProof',
        params: [
          campaignId,
          IPFS_HASH_1,
          'Initial implementation plan with budget breakdown',
          firstReleaseAmount.toString(),
        ],
        from: ngoWallet.address,
      };

      const submitProofResult = await transactionService.executeTransaction(submitProofTx);
      expect(submitProofResult.success).toBe(true);
      console.log(`Proof submitted, tx hash: ${submitProofResult.transactionHash}`);

      // Wait for the proof submission event
      const proofEvent = await proofSubmittedPromise;
      proofId = proofEvent.proofId;
      console.log(`Proof ID: ${proofId}`);
      expect(proofId).toBeTruthy();
    });

    it('Verifier approves proof and releases first milestone funds', async () => {
      // Setup event listener for funds release
      const fundsReleasedPromise = new Promise<any>((resolve) => {
        eventEmitter.once('FundReleaseManager:FundsReleased', (event) => {
          resolve(event.returnValues);
        });
      });

      // Approve proof transaction
      const approveProofTx = {
        contractName: 'FundReleaseManager',
        method: 'approveProofAndReleaseFunds',
        params: [proofId],
        from: verifierWallet.address,
      };

      const approveProofResult = await transactionService.executeTransaction(approveProofTx);
      expect(approveProofResult.success).toBe(true);
      console.log(`Proof approved and funds released, tx hash: ${approveProofResult.transactionHash}`);

      // Wait for the funds release event
      const fundsEvent = await fundsReleasedPromise;
      expect(fundsEvent.campaignId.toString()).toBe(campaignId.toString());
      expect(fundsEvent.proofId).toBe(proofId);
      console.log(`Released amount: ${ethers.utils.formatUnits(fundsEvent.amount, 6)} USDT`);
    });
  });

  describe('Cleanup', () => {
    it('Cleans up resources', () => {
      transactionService.cleanupEventListeners();
    });
  });
});