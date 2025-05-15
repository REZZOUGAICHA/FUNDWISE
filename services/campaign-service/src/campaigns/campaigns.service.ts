import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PinataService } from '../ipfs/pinata.service';
import { CreateCampaignDto, ProofSubmissionDto } from './dto/campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    private prisma: PrismaService,
    private pinataService: PinataService
  ) {}

  async createCampaign(data: CreateCampaignDto, imageBuffer: Buffer): Promise<any> {
    // Upload image to IPFS
    const imageCid = await this.pinataService.uploadBuffer(
      imageBuffer,
      `campaign_image_${Date.now()}`
    );

    // Create campaign with IPFS hash
    return this.prisma.campaigns.create({
      data: {
        title: data.title,
        description: data.description,
        target_amount: parseFloat(data.target_amount.toString()),
        end_date: new Date(data.end_date),
        organization_id: data.organization_id,
        image_url: this.pinataService.getIPFSUrl(imageCid),
        ipfs_hash: imageCid,
        status: 'active'
      }
    });
  }

  async addProofOfFundUsage(
    campaignId: string,
    proofData: ProofSubmissionDto,
    documentBuffer: Buffer
  ): Promise<any> {
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
        amount_used: parseFloat(proofData.amountUsed.toString()),
        ipfs_hash: documentCid,
        submitted_by: proofData.submittedBy
      }
    });
  }
}
