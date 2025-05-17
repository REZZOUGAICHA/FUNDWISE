import { Injectable } from '@nestjs/common';
import { PinataService } from './ipfs/pinata.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto, ProofSubmissionDto } from './types/campaign.types';

@Injectable()
export class AppService  {
  getHello(): string {
    throw new Error('Method not implemented.');
  }
  constructor(
    private prisma: PrismaService,
    private pinataService: PinataService
  ) {}

  async createCampaign(data: CreateCampaignDto, imageBuffer: Buffer) {
    // Upload image to IPFS
    const imageCid = await this.pinataService.uploadBuffer(
      imageBuffer,
      `campaign_image_${Date.now()}`
    );

    // Create campaign with IPFS hash
    return this.prisma.campaigns.create({
      data: {
        ...data,
        image_url: this.pinataService.getIPFSUrl(imageCid),
        ipfs_hash: imageCid
      }
    });
  }

  async addProofOfFundUsage(
    campaignId: string, 
    proofData: ProofSubmissionDto, 
    documentBuffer: Buffer
  ) {
    // Upload proof document to IPFS
    const documentCid = await this.pinataService.uploadBuffer(
      documentBuffer,
      `proof_doc_${campaignId}_${Date.now()}`
    );

    // Create proof record with IPFS hash
    return this.prisma.proofs.create({
      data: {
        campaign_id: campaignId,
        description: proofData.description,
        amount_used: proofData.amountUsed,
        ipfs_hash: documentCid,
        submitted_by: proofData.submittedBy
      }
    });
  }
}
