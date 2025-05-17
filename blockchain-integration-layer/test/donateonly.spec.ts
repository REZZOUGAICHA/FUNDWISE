// blockchain-integration-layer/test/donation-to-id17.spec.ts

import { EventEmitter2 } from '@nestjs/event-emitter';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

import { WalletManagementService } from '../services/wallet-management/wallet-management.service';
import { TransactionService } from '../services/transaction/transaction.service';
import { ConfigService } from '@nestjs/config';

// Default test timeout
const DEFAULT_TIMEOUT = 120000; // 120 seconds

// Mock config service (EXACTLY as in your file)
class MockConfigService {
  get(key: string) {
    if (key === 'blockchain.rpcUrl') return 'http://127.0.0.1:8545';
    if (key === 'blockchain.admin.privateKey') return '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    if (key === 'blockchain.contracts.campaignManager') {
      return '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    }
    if (key === 'blockchain.contracts.donationManager') {
      return '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
    }
    if (key === 'blockchain.contracts.fundReleaseManager') {
      return '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';
    }
    if (key === 'blockchain.contracts.proofStorage') {
      return '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
    }
    if (key === 'blockchain.contracts.mockToken') {
      return '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    }
    return null;
  }
}

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

describe('Donate to Existing Campaign ID 17', () => {
  let transactionService: TransactionService;
  let walletService: WalletManagementService;
  let eventEmitter: EventEmitter2;
  let configService: ConfigService;

  let adminWallet: ethers.Wallet;
  let donorWallet: ethers.Wallet;

  const campaignId = 19; // <<<<<<<<<<< Only donate to this campaign!

  beforeAll(async () => {
    eventEmitter = new EventEmitter2({
      wildcard: true,
      delimiter: ':',
      maxListeners: 20,
      verboseMemoryLeak: true,
    });

    configService = new MockConfigService() as unknown as ConfigService;
    walletService = new WalletManagementService(configService);
    transactionService = new TransactionService(walletService, configService, eventEmitter);

    // Set up admin wallet
    adminWallet = walletService.getAdminWallet();
    const provider = walletService.getProvider();

    // Create donor wallet and fund it
    donorWallet = ethers.Wallet.createRandom().connect(provider);
    walletService.importWallet(donorWallet.privateKey);

    // Fund donor with ETH for gas
    await adminWallet.sendTransaction({
      to: donorWallet.address,
      value: ethers.utils.parseEther("1.0"),
    });

    // Mint USDT for donor
    await transactionService.executeTransaction({
      contractName: 'MockToken',
      method: 'mint',
      params: [donorWallet.address, ethers.utils.parseUnits('1000', 6).toString()],
      from: adminWallet.address
    });

    // Wait for funds to be available
    await new Promise(resolve => setTimeout(resolve, 2000));
  }, DEFAULT_TIMEOUT);

  it('should approve and donate USDT to campaign 17', async () => {
    const donationAmount = ethers.utils.parseUnits('500', 6).toString();
    const donationManagerAddress = configService.get('blockchain.contracts.donationManager');

    // 1. Approve tokens for donation manager
    const approveTx = await transactionService.executeTransaction({
      contractName: 'MockToken',
      method: 'approve',
      params: [donationManagerAddress, donationAmount],
      from: donorWallet.address
    });
    expect(approveTx.success).toBeTruthy();
    console.log(`Approved ${donationAmount} tokens for donation`);

    // 2. Donate to campaign 17
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
    if (transactionService) {
      transactionService.cleanupEventListeners();
    }
    eventEmitter.removeAllListeners();
    await new Promise(resolve => setTimeout(resolve, 2000));
  });
});
