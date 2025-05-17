import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WalletManagementService {
  private readonly logger = new Logger(WalletManagementService.name);
  private provider!: ethers.providers.Provider;
  private wallets: Map<string, ethers.Wallet> = new Map();
  private adminWallet!: ethers.Wallet;

  constructor(private configService: ConfigService) {
    this.initializeProvider();
    this.initializeAdminWallet();
  }

  /**
   * Initialize the blockchain provider
   */
  private initializeProvider() {
    const rpcUrl = this.configService.get<string>('blockchain.rpcUrl');
    if (!rpcUrl) {
      throw new Error('RPC URL not configured');
    }

    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.logger.log(`Provider initialized with RPC URL: ${rpcUrl}`);
  }

  /**
   * Initialize the admin wallet
   */
  private initializeAdminWallet() {
    const adminPrivateKey = this.configService.get<string>('blockchain.admin.privateKey');
    if (!adminPrivateKey) {
      throw new Error('Admin private key not configured');
    }

    this.adminWallet = new ethers.Wallet(adminPrivateKey, this.provider);
    this.wallets.set(this.adminWallet.address.toLowerCase(), this.adminWallet);
    this.logger.log(`Admin wallet initialized with address: ${this.adminWallet.address}`);
  }

  /**
   * Get the blockchain provider
   */
  getProvider(): ethers.providers.Provider {
    return this.provider;
  }

  /**
   * Get the admin wallet
   */
  getAdminWallet(): ethers.Wallet {
    return this.adminWallet;
  }

  /**
   * Get a wallet by address
   */
  getWallet(address: string): ethers.Wallet | undefined {
    return this.wallets.get(address.toLowerCase());
  }

  /**
   * Create a new wallet
   */
  createWallet(): ethers.Wallet {
    const wallet = ethers.Wallet.createRandom().connect(this.provider);
    this.wallets.set(wallet.address.toLowerCase(), wallet);
    this.logger.log(`Created new wallet with address: ${wallet.address}`);
    return wallet;
  }

  /**
   * Import a wallet from private key
   */
  importWallet(privateKey: string): ethers.Wallet {
    const wallet = new ethers.Wallet(privateKey, this.provider);
    this.wallets.set(wallet.address.toLowerCase(), wallet);
    this.logger.log(`Imported wallet with address: ${wallet.address}`);
    return wallet;
  }

  /**
   * Get the list of addresses for all wallets
   */
  getWalletAddresses(): string[] {
    return Array.from(this.wallets.keys());
  }

  /**
   * Get the balance of a wallet
   */
  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  }

  /**
   * Sign a message with a wallet
   */
  async signMessage(address: string, message: string): Promise<string> {
    const wallet = this.getWallet(address);
    if (!wallet) {
      throw new Error(`Wallet not found for address: ${address}`);
    }
    
    return await wallet.signMessage(message);
  }

  /**
   * Check if a wallet exists
   */
  hasWallet(address: string): boolean {
    return this.wallets.has(address.toLowerCase());
  }
}