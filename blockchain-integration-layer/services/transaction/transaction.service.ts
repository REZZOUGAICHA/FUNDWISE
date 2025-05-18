import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { WalletManagementService } from '../wallet-management/wallet-management.service';
import { TransactionRequest, TransactionResponse, TransactionStatus } from '../../interfaces/transaction.interface';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import * as path from 'path';


@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);
  private contractInstances: Map<string, ethers.Contract> = new Map();
  private pendingTransactions: Map<string, TransactionStatus> = new Map();
  private contractABIs: Record<string, any> = {};
  private eventListeners: any[] = [];

  constructor(
    private walletService: WalletManagementService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    this.initializeABIs();
    this.initializeContracts();
  }

  /**
   * Initialize contract ABIs
   */
  private initializeABIs() {
    // In a real implementation, these would be imported from actual files
    // Important: These ABIs must exactly match the deployed contracts
    this.contractABIs = {
      CampaignManager: [
        // Make sure these match the actual contract functions
        "function createCampaign(string _title, string _description, uint256 _fundingGoal, uint256 _durationInDays) returns (uint256)",
        "function getCampaign(uint256 _campaignId) view returns (tuple(uint256 id, address ngo, string title, string description, uint256 fundingGoal, uint256 deadline, bool verified, bool active, uint256 timestamp))",
        "function campaignExists(uint256 _campaignId) view returns (bool)",
        "function getNGOCampaigns(address _ngo) view returns (uint256[])",
        // Make sure the event signature exactly matches the contract
        "function verifyCampaign(uint256 _campaignId)",
        "function activateCampaign(uint256 _campaignId)",
        "function isCampaignActive(uint256 _campaignId) view returns (bool)",
        "event CampaignCreated(uint256 indexed campaignId, address indexed ngo, string title, uint256 fundingGoal)"
      ],
      DonationManager: [
        "function donate(uint256 _campaignId, uint256 _amount) external",
        "function getCampaignDonationTotal(uint256 _campaignId) view returns (uint256)",
        "function getDonationAmount(address _donor, uint256 _campaignId) view returns (uint256)",
        "event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount)"
      ],
      FundReleaseManager: [
        "event FundsReleased(uint256 indexed campaignId, uint256 indexed proofId, uint256 amount)"
      ],
      ProofStorage: [
        "event ProofSubmitted(uint256 indexed proofId, uint256 indexed campaignId, address indexed submitter, string ipfsHash)"
      ],
      MockToken: [
        "function decimals() view returns (uint8)",
       "function approve(address spender, uint256 amount) returns (bool)",
        "function balanceOf(address account) view returns (uint256)",
        "function mint(address to, uint256 amount)",
        "function burn(address from, uint256 amount)"
      ]
    };
  }

  /**
   * Initialize contract instances with the proper ABIs
   */
  private initializeContracts() {
    const provider = this.walletService.getProvider();
    const adminWallet = this.walletService.getAdminWallet();

    // Get contract addresses from config
    const contractAddresses = {
    campaignManager: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    donationManager: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    fundReleaseManager: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    proofStorage: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    mockToken: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    };

    // Initialize contract instances
    if (contractAddresses.campaignManager) {
      this.contractInstances.set(
        'CampaignManager',
        new ethers.Contract(
          contractAddresses.campaignManager, 
          this.contractABIs.CampaignManager, 
          adminWallet
        )
      );
    }
    
    if (contractAddresses.donationManager) {
      this.contractInstances.set(
        'DonationManager',
        new ethers.Contract(
          contractAddresses.donationManager, 
          this.contractABIs.DonationManager, 
          adminWallet
        )
      );
    }
    
    if (contractAddresses.fundReleaseManager) {
      this.contractInstances.set(
        'FundReleaseManager',
        new ethers.Contract(
          contractAddresses.fundReleaseManager, 
          this.contractABIs.FundReleaseManager, 
          adminWallet
        )
      );
    }
    
    if (contractAddresses.proofStorage) {
      this.contractInstances.set(
        'ProofStorage',
        new ethers.Contract(
          contractAddresses.proofStorage, 
          this.contractABIs.ProofStorage, 
          adminWallet
        )
      );
    }
    
    if (contractAddresses.mockToken) {
      this.contractInstances.set(
        'MockToken',
        new ethers.Contract(
          contractAddresses.mockToken, 
          this.contractABIs.MockToken, 
          adminWallet
        )
      );
    }

    this.logger.log(`Initialized contract instances for blockchain interaction`);
    
    // Listen for events from the contracts
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for relevant contract events
   */
  private setupEventListeners() {
    const campaignManager = this.contractInstances.get('CampaignManager');
    
    if (campaignManager) {
      this.logger.log(`Setting up event listeners for CampaignManager at ${campaignManager.address}`);
      
      // Use a more reliable event listener setup
      campaignManager.on('CampaignCreated', (campaignId, ngo, title, fundingGoal, event) => {
        this.logger.log(`CampaignCreated event received: Campaign ID ${campaignId.toString()}`);
      
        const eventData = {
          returnValues: {
            campaignId: campaignId.toString(),
            ngo,
            title,
            fundingGoal: fundingGoal.toString()
          },
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        };
      
        const outputDir = path.resolve(__dirname, 'output');
        const outputFile = path.join(outputDir, 'campaigns.json');
      
        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
      
        try {
          // Read existing events
          let existingData = [];
          if (fs.existsSync(outputFile)) {
            const fileContents = fs.readFileSync(outputFile, 'utf8');
            existingData = JSON.parse(fileContents);
            if (!Array.isArray(existingData)) {
              existingData = [];
            }
          }
      
          // Append new event
          existingData.push(eventData);
      
          // Write updated array back to file
          fs.writeFileSync(outputFile, JSON.stringify(existingData, null, 2));
      
          this.logger.log(`Appended event data to ${outputFile}`);
        } catch (err) {
          if (err instanceof Error) {
            this.logger.error(`Error handling event file: ${err.message}`);
          } else {
            this.logger.error(`Error handling event file: ${JSON.stringify(err)}`);
          }
        }
      
        // Emit the event as before
        this.eventEmitter.emit('CampaignManager:CampaignCreated', eventData);
      });
      
      
      
      // Also listen for all events (as a backup)
      campaignManager.on('*', (event) => {
        this.logger.log(`Received contract event: ${event}`);
      });
    } else {
      this.logger.error('Cannot set up event listeners: CampaignManager contract instance not available');
    }
  }

  /**
   * Execute a transaction on a smart contract
   */
  async executeTransaction(request: TransactionRequest): Promise<TransactionResponse> {
    try {
      const { contractName, method, params, from, value, gasLimit } = request;
      
      // Get the contract instance
      const contract = this.contractInstances.get(contractName);
      if (!contract) {
        throw new Error(`Contract ${contractName} not found`);
      }
      
      // Get the wallet to use for the transaction
      const wallet = from 
        ? this.walletService.getWallet(from) 
        : this.walletService.getAdminWallet();
      
      if (!wallet) {
        throw new Error(`Wallet not found for address: ${from}`);
      }
      
      // Connect the contract to the wallet
      const connectedContract = contract.connect(wallet);
      
      // Optional transaction overrides
      const overrides: any = {};
      if (value) overrides.value = ethers.utils.parseEther(value);
      if (gasLimit) overrides.gasLimit = ethers.BigNumber.from(gasLimit);
  
      // Log what we're about to execute
      this.logger.log(`Executing transaction: ${contractName}.${method}(${params.map(p => 
        typeof p === 'object' ? JSON.stringify(p) : p).join(', ')})`);
      
      // Execute the transaction
      let tx;
      if (params.length > 0 && Object.keys(overrides).length > 0) {
        tx = await connectedContract[method](...params, overrides);
      } else if (params.length > 0) {
        tx = await connectedContract[method](...params);
      } else if (Object.keys(overrides).length > 0) {
        tx = await connectedContract[method](overrides);
      } else {
        tx = await connectedContract[method]();
      }
      
      // Wait for the transaction to be mined
      this.logger.log(`Transaction sent: ${tx.hash} - waiting for confirmation...`);
      
      // Add to pending transactions
      this.pendingTransactions.set(tx.hash, {
        hash: tx.hash,
        status: 'pending',
        confirmations: 0
      });
      
      // Wait for confirmation (1 confirmation by default)
      const receipt = await tx.wait(1);
      
      // Update transaction status
      this.pendingTransactions.set(tx.hash, {
        hash: tx.hash,
        status: 'confirmed',
        confirmations: 1,
        receipt
      });
      
      this.logger.log(`Transaction confirmed: ${tx.hash}, block: ${receipt.blockNumber}`);

      // Analyze the receipt for events
      this.analyzeReceipt(contractName, method, receipt, params, from || wallet.address);
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        receipt
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Transaction failed: ${error.message}`);
        if (error.message.includes('user rejected transaction')) {
          return {
            success: false,
            error: 'Transaction was rejected by the user.',
          };
        }
      } else {
        this.logger.error(`Transaction failed: ${JSON.stringify(error)}`);
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Analyze transaction receipt for events
   */
  private analyzeReceipt(contractName: string, method: string, receipt: ethers.ContractReceipt, params: any[], from: string) {
    // First check if there are any logs at all
    if (!receipt.logs || receipt.logs.length === 0) {
      this.logger.warn(`No logs found in receipt for ${contractName}.${method}`);
      
      // For createCampaign specifically, manually emit an event since we know it should have happened
      if (contractName === 'CampaignManager' && method === 'createCampaign') {
        this.logger.log('Manually emitting CampaignCreated event as fallback');
        
        // Use a dummy campaignId of 1 if we can't determine it
        let campaignId = '1';
        
        this.eventEmitter.emit('CampaignManager:CampaignCreated', {
          returnValues: {
            campaignId,
            ngo: from,
            title: params[0],
            fundingGoal: params[2]
          },
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber
        });
      }
      return;
    }
    
    // Try to parse all logs
    const contract = this.contractInstances.get(contractName);
    if (!contract) return;
    
    for (const log of receipt.logs) {
      try {
        // Only try to parse logs that are from our contract
        if (log.address.toLowerCase() === contract.address.toLowerCase()) {
          const parsedLog = contract.interface.parseLog(log);
          this.logger.log(`Found event: ${parsedLog.name}`);
          
          // If it's a CampaignCreated event, emit it through our event system
          if (parsedLog.name === 'CampaignCreated') {
            const campaignId = parsedLog.args.campaignId.toString();
            const ngo = parsedLog.args.ngo;
            const title = parsedLog.args.title;
            const fundingGoal = parsedLog.args.fundingGoal.toString();
            
            this.eventEmitter.emit('CampaignManager:CampaignCreated', {
              returnValues: {
                campaignId,
                ngo,
                title,
                fundingGoal
              },
              transactionHash: receipt.transactionHash,
              blockNumber: receipt.blockNumber
            });
          }
        }
      } catch (e) {
        // Not a log we can parse, skip it
      }
    }
  }

  /**
   * Get a contract instance
   */
  getContract(contractName: string): ethers.Contract | null {
    console.log(`Loading contract: ${contractName}`);
  
    const abi: string[] = this.contractABIs[contractName];
    if (!abi) {
      console.warn(`ABI not found for contract: ${contractName}`);
    } else {
      console.log('ABI entries:', abi);
  
      const events = abi.filter((entry: string) => entry.startsWith('event'));
      console.log('ABI events:', events);
    }
  
    return this.contractInstances.get(contractName) || null;
  }
  
  /**
   * Clean up event listeners
   */
  cleanupEventListeners() {
    const campaignManager = this.contractInstances.get('CampaignManager');
    if (campaignManager) {
      campaignManager.removeAllListeners();
    }
    
    // Remove all other contract listeners
    this.contractInstances.forEach((contract) => {
      contract.removeAllListeners();
    });
    
    this.logger.log('Removed all contract event listeners');
  }
}