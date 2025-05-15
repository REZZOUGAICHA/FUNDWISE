import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as FormData from 'form-data';
import axios from 'axios';

@Injectable()
export class PinataService implements OnModuleInit {
  private apiKey: string;
  private apiSecret: string;
  private gateway: string;

  constructor(private configService: ConfigService) {}
  
  onModuleInit() {
    const apiKey = this.configService.get<string>('PINATA_API_KEY');
    const apiSecret = this.configService.get<string>('PINATA_API_SECRET');
    
    if (!apiKey || !apiSecret) {
      throw new Error('PINATA_API_KEY and PINATA_API_SECRET must be defined in environment variables');
    }
    
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.gateway = this.configService.get<string>('PINATA_GATEWAY') || 'https://gateway.pinata.cloud/ipfs';
  }

  async uploadBuffer(buffer: Buffer, name: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', buffer, { filename: name });
      
      // Add metadata
      formData.append('pinataMetadata', JSON.stringify({ name }));
      
      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
          pinata_api_key: this.apiKey,
          pinata_secret_api_key: this.apiSecret,
        },
      });
      
      return response.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading buffer to IPFS:', error);
      throw error;
    }
  }

  async uploadJSON(json: any, name: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
          pinataMetadata: { name },
          pinataContent: json
        },
        {
          headers: {
            'Content-Type': 'application/json',
            pinata_api_key: this.apiKey,
            pinata_secret_api_key: this.apiSecret,
          }
        }
      );
      
      return response.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw error;
    }
  }

  getIPFSUrl(cid: string): string {
    return `${this.gateway}/${cid}`;
  }
}
