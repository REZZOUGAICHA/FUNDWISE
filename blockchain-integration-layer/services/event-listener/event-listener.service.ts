import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BlockchainEvent, EventSubscription, EventFilter } from '../../interfaces/event.interface';
import { WalletManagementService } from '../wallet-management/wallet-management.service';

// Import contract ABIs and addresses
import { CONTRACT_ADDRESSES } from '../../contracts/contract-addresses';
import { CONTRACT_ABIS } from '../../contracts/contract-abis';

@Injectable()
export class EventListenerService implements OnModuleInit {
  private readonly logger = new Logger(EventListenerService.name);
  private provider: ethers.providers.Provider;
  private contractInstances: Map<string, ethers.Contract> = new Map();
  private eventSubscriptions: Map<string, EventSubscription[]> = new Map();
  private lastProcessedBlock: number = 0;
  private isPolling: boolean = false;
  private pollInterval: NodeJS.Timeout | undefined;

  constructor(
    private configService: ConfigService,
    private walletService: WalletManagementService,
    private eventEmitter: EventEmitter2,
  ) {
    this.provider = this.walletService.getProvider();
  }

  async onModuleInit() {
    // Initialize contract instances
    await this.initializeContracts();
    
    // Start listening for events
    this.startEventPolling(10000); // Poll every 10 seconds
    
    // Register default event subscriptions
    this.registerDefaultEventSubscriptions();
    
    this.logger.log('EventListenerService initialized');
  }

  /**
   * Initialize contract instances for event listening
   */
  private async initializeContracts() {
    // Initialize contract instances for all contracts
    this.contractInstances.set(
      'CampaignManager',
      new ethers.Contract(
        CONTRACT_ADDRESSES.campaignManager,
        CONTRACT_ABIS.CampaignManager,
        this.provider
      )
    );

    this.contractInstances.set(
      'DonationManager',
      new ethers.Contract(
        CONTRACT_ADDRESSES.donationManager,
        CONTRACT_ABIS.DonationManager,
        this.provider
      )
    );

    this.contractInstances.set(
      'FundReleaseManager',
      new ethers.Contract(
        CONTRACT_ADDRESSES.fundReleaseManager,
        CONTRACT_ABIS.FundReleaseManager,
        this.provider
      )
    );

    this.contractInstances.set(
      'ProofStorage',
      new ethers.Contract(
        CONTRACT_ADDRESSES.proofStorage,
        CONTRACT_ABIS.ProofStorage,
        this.provider
      )
    );

    // Get last processed block - in production, this would be stored persistently
    this.lastProcessedBlock = await this.provider.getBlockNumber() - 10; // Start 10 blocks back for safety
    this.logger.log(`Starting event polling from block ${this.lastProcessedBlock}`);
  }

  /**
   * Register default event subscriptions for important contract events
   */
  private registerDefaultEventSubscriptions() {
    // Campaign events
    this.subscribe({
      contractName: 'CampaignManager',
      eventName: 'CampaignCreated',
      callback: (event: BlockchainEvent) => this.handleCampaignCreated(event),
    });

    this.subscribe({
      contractName: 'CampaignManager',
      eventName: 'CampaignVerified',
      callback: (event: BlockchainEvent) => this.handleCampaignVerified(event),
    });

    this.subscribe({
      contractName: 'CampaignManager',
      eventName: 'CampaignActivated',
      callback: (event: BlockchainEvent) => this.handleCampaignStatusChanged(event, true),
    });

    this.subscribe({
      contractName: 'CampaignManager',
      eventName: 'CampaignDeactivated',
      callback: (event: BlockchainEvent) => this.handleCampaignStatusChanged(event, false),
    });

    // Donation events
    this.subscribe({
      contractName: 'DonationManager',
      eventName: 'DonationReceived',
      callback: (event: BlockchainEvent) => this.handleDonationReceived(event),
    });

    // Fund release events
    this.subscribe({
      contractName: 'FundReleaseManager',
      eventName: 'FundsReleased',
      callback: (event: BlockchainEvent) => this.handleFundsReleased(event),
    });

    this.subscribe({
      contractName: 'FundReleaseManager',
      eventName: 'ProofRejected',
      callback: (event: BlockchainEvent) => this.handleProofRejected(event),
    });

    // Proof storage events
    this.subscribe({
      contractName: 'ProofStorage',
      eventName: 'ProofSubmitted',
      callback: (event: BlockchainEvent) => this.handleProofSubmitted(event),
    });

    this.subscribe({
      contractName: 'ProofStorage',
      eventName: 'ProofStatusChanged',
      callback: (event: BlockchainEvent) => this.handleProofStatusChanged(event),
    });
  }

  /**
   * Subscribe to an event from a contract
   * @param subscription Event subscription details
   */
  subscribe(subscription: EventSubscription): void {
    const key = `${subscription.contractName}:${subscription.eventName}`;
    
    if (!this.eventSubscriptions.has(key)) {
      this.eventSubscriptions.set(key, []);
    }
    
    const subscriptions = this.eventSubscriptions.get(key);
    if (subscriptions) {
      subscriptions.push(subscription);
    }
    
    this.logger.log(`Subscribed to ${key}`);
  }

  /**
   * Unsubscribe from an event
   * @param contractName Contract name
   * @param eventName Event name
   * @param callback Optional callback to remove specific subscription
   */
  unsubscribe(contractName: string, eventName: string, callback?: Function): void {
    const key = `${contractName}:${eventName}`;
    
    if (!this.eventSubscriptions.has(key)) {
      return;
    }
    
    if (callback) {
      // Remove specific subscription
      const subscriptions = this.eventSubscriptions.get(key);
      
      if (subscriptions) {
        this.eventSubscriptions.set(
          key,
          subscriptions.filter(sub => sub.callback !== callback)
        );
      }
    } else {
      // Remove all subscriptions for this event
      this.eventSubscriptions.delete(key);
    }
    
    this.logger.log(`Unsubscribed from ${key}`);
  }

  /**
   * Start polling for events
   * @param interval Poll interval in milliseconds
   */
  startEventPolling(interval: number): void {
    if (this.isPolling) {
      return;
    }
    
    this.isPolling = true;
    this.pollInterval = setInterval(async () => {
      try {
        await this.pollEvents();
      } catch (error) {
        if (error instanceof Error) {
          this.logger.error(`Error polling events: ${error.message}`);
        } else {
          this.logger.error('Error polling events: Unknown error');
        }
      }
    }, interval);
    
    this.logger.log(`Started event polling with interval ${interval}ms`);
  }

  /**
   * Stop polling for events
   */
  stopEventPolling(): void {
    if (!this.isPolling) {
      return;
    }
    
    clearInterval(this.pollInterval);
    this.isPolling = false;
    this.logger.log('Stopped event polling');
  }

  /**
   * Poll for events from all contracts
   */
  private async pollEvents(): Promise<void> {
    const currentBlock = await this.provider.getBlockNumber();
    
    if (currentBlock <= this.lastProcessedBlock) {
      return; // No new blocks to process
    }
    
    // Process blocks in batches to avoid too many events at once
    const batchSize = 100;
    const fromBlock = this.lastProcessedBlock + 1;
    const toBlock = Math.min(fromBlock + batchSize - 1, currentBlock);
    
    this.logger.log(`Polling events from block ${fromBlock} to ${toBlock}`);
    
    // Process events for each contract
    for (const [contractName, contract] of this.contractInstances.entries()) {
      try {
        // Get all events for this contract in the block range
        const events = await contract.queryFilter({}, fromBlock, toBlock);
        
        // Process each event
        for (const event of events) {
          await this.processEvent(contractName, event);
        }
      } catch (error) {
        if (error instanceof Error) {
          this.logger.error(`Error processing events for ${contractName}: ${error.message}`);
        } else {
          this.logger.error(`Error processing events for ${contractName}: Unknown error`);
        }
      }
    }
    
    // Update last processed block
    this.lastProcessedBlock = toBlock;
  }

  /**
   * Process a single event
   * @param contractName Contract name
   * @param event Event object
   */
  private async processEvent(contractName: string, event: ethers.Event): Promise<void> {
    try {
      // Get event details
      const eventName = event.event;
      
      if (!eventName) {
        return; // Skip anonymous events
      }
      
      const key = `${contractName}:${eventName}`;
      const subscriptions = this.eventSubscriptions.get(key);
      
      if (!subscriptions || subscriptions.length === 0) {
        return; // No subscriptions for this event
      }
      
      // Get block timestamp
      const block = await this.provider.getBlock(event.blockNumber);
      if (!block) {
        this.logger.error(`Could not get block for number ${event.blockNumber}`);
        return;
      }
      
      // Create blockchain event object
      const blockchainEvent: BlockchainEvent = {
        contractName,
        eventName,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        returnValues: event.args || {},
        timestamp: block.timestamp,
      };
      
      // Notify all subscribers
      for (const subscription of subscriptions) {
        try {
          await subscription.callback(blockchainEvent);
        } catch (error) {
          if (error instanceof Error) {
            this.logger.error(`Error in event handler for ${key}: ${error.message}`);
          } else {
            this.logger.error(`Error in event handler for ${key}: Unknown error`);
          }
        }
      }
      
      // Also emit a standard NestJS event for microservices to consume
      this.eventEmitter.emit(key, blockchainEvent);
      
      this.logger.log(`Processed event ${key} from tx ${event.transactionHash}`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error processing event: ${error.message}`);
      } else {
        this.logger.error('Error processing event: Unknown error');
      }
    }
  }

  /**
   * Get past events from contracts
   * @param contractName Contract name
   * @param eventName Event name
   * @param filter Filter options
   * @returns Array of blockchain events
   */
  async getPastEvents(
    contractName: string,
    eventName: string,
    filter: EventFilter = {}
  ): Promise<BlockchainEvent[]> {
    try {
      const contract = this.contractInstances.get(contractName);
      
      if (!contract) {
        throw new Error(`Contract ${contractName} not found`);
      }
      
      // Convert filter to ethers format
      const ethersFilter = {
        fromBlock: filter.fromBlock || 0,
        toBlock: filter.toBlock || 'latest',
        address: filter.address,
        topics: filter.topics,
      };
      
      // Get events
      const events = await contract.queryFilter(
        contract.filters[eventName](),
        ethersFilter.fromBlock,
        ethersFilter.toBlock
      );
      
      // Convert to blockchain events
      const blockchainEvents: BlockchainEvent[] = [];
      
      for (const event of events) {
        const block = await this.provider.getBlock(event.blockNumber);
        if (!block) {
          this.logger.warn(`Could not get block for number ${event.blockNumber}, skipping event`);
          continue;
        }
        
        blockchainEvents.push({
          contractName,
          eventName,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
          returnValues: event.args || {},
          timestamp: block.timestamp,
        });
      }
      
      return blockchainEvents;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error getting past events: ${error.message}`);
      } else {
        this.logger.error('Error getting past events: Unknown error');
      }
      return [];
    }
  }

  /**
   * Handle CampaignCreated event
   * @param event Blockchain event
   */
  private handleCampaignCreated(event: BlockchainEvent): void {
    const { campaignId, ngo, title, fundingGoal } = event.returnValues;
    
    this.logger.log(`Campaign created: #${campaignId} - ${title} by ${ngo} with goal ${fundingGoal}`);
    
    // In a real application, you would:
    // 1. Save campaign details to database
    // 2. Notify relevant microservices via message broker
    
    // For example:
    this.eventEmitter.emit('campaign.created', {
      campaignId: campaignId.toString(),
      ngoAddress: ngo,
      title,
      fundingGoal: fundingGoal.toString(),
      blockchainTxHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp: event.timestamp,
    });
  }

  /**
   * Handle CampaignVerified event
   * @param event Blockchain event
   */
  private handleCampaignVerified(event: BlockchainEvent): void {
    const { campaignId, verifier } = event.returnValues;
    
    this.logger.log(`Campaign verified: #${campaignId} by ${verifier}`);
    
    this.eventEmitter.emit('campaign.verified', {
      campaignId: campaignId.toString(),
      verifierAddress: verifier,
      blockchainTxHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp: event.timestamp,
    });
  }

  /**
   * Handle CampaignActivated and CampaignDeactivated events
   * @param event Blockchain event
   * @param isActive Whether the campaign is active
   */
  private handleCampaignStatusChanged(event: BlockchainEvent, isActive: boolean): void {
    const { campaignId } = event.returnValues;
    
    this.logger.log(`Campaign ${isActive ? 'activated' : 'deactivated'}: #${campaignId}`);
    
    this.eventEmitter.emit('campaign.status-changed', {
      campaignId: campaignId.toString(),
      isActive,
      blockchainTxHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp: event.timestamp,
    });
  }

  /**
   * Handle DonationReceived event
   * @param event Blockchain event
   */
  private handleDonationReceived(event: BlockchainEvent): void {
    const { campaignId, donor, amount } = event.returnValues;
    
    this.logger.log(`Donation received: ${amount} USDT to campaign #${campaignId} from ${donor}`);
    
    this.eventEmitter.emit('donation.received', {
      campaignId: campaignId.toString(),
      donorAddress: donor,
      amount: amount.toString(),
      blockchainTxHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp: event.timestamp,
    });
  }

  /**
   * Handle FundsReleased event
   * @param event Blockchain event
   */
  private handleFundsReleased(event: BlockchainEvent): void {
    const { campaignId, proofId, ngo, amount } = event.returnValues;
    
    this.logger.log(`Funds released: ${amount} USDT to ${ngo} for campaign #${campaignId}`);
    
    this.eventEmitter.emit('funds.released', {
      campaignId: campaignId.toString(),
      proofId,
      ngoAddress: ngo,
      amount: amount.toString(),
      blockchainTxHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp: event.timestamp,
    });
  }

  /**
   * Handle ProofRejected event
   * @param event Blockchain event
   */
  private handleProofRejected(event: BlockchainEvent): void {
    const { campaignId, proofId, reason } = event.returnValues;
    
    this.logger.log(`Proof rejected: ${proofId} for campaign #${campaignId} - Reason: ${reason}`);
    
    this.eventEmitter.emit('proof.rejected', {
      campaignId: campaignId.toString(),
      proofId,
      reason,
      blockchainTxHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp: event.timestamp,
    });
  }

  /**
   * Handle ProofSubmitted event
   * @param event Blockchain event
   */
  private handleProofSubmitted(event: BlockchainEvent): void {
    const { proofId, campaignId, ipfsHash, amount } = event.returnValues;
    
    this.logger.log(`Proof submitted: ${proofId} for campaign #${campaignId} - IPFS: ${ipfsHash}`);
    
    this.eventEmitter.emit('proof.submitted', {
      proofId,
      campaignId: campaignId.toString(),
      ipfsHash,
      amount: amount.toString(),
      blockchainTxHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp: event.timestamp,
    });
  }

  /**
   * Handle ProofStatusChanged event
   * @param event Blockchain event
   */
  private handleProofStatusChanged(event: BlockchainEvent): void {
    const { proofId, status } = event.returnValues;
    
    this.logger.log(`Proof status changed: ${proofId} to status ${status}`);
    
    this.eventEmitter.emit('proof.status-changed', {
      proofId,
      status: parseInt(status),
      blockchainTxHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp: event.timestamp,
    });
  }
}