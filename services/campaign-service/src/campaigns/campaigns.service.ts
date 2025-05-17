// services/campaign-service/src/campaign/campaigns.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Organization } from './types/organization.type';
import { FundReleaseRequest } from './types/fund-release-request.type';
import { ProofDto } from './dto/proof.dto';
import { FundReleaseDto } from './dto/fund-release.dto';
import { PinataService } from '../ipfs/pinata.service';

@Injectable()
export class CampaignService {
  constructor(
    private prisma: PrismaService,
    private pinataService: PinataService,
    @Inject('VERIFICATION_SERVICE') private verificationClient: ClientProxy,
  ) {}

  async findAll(status?: string, organizationId?: string) {
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (organizationId) {
      where.organization_id = organizationId;
    }
    
    const campaigns = await this.prisma.campaigns.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
    });
    
    // Fetch organization names for each campaign
    const campaignsWithOrgNames = await Promise.all(
      campaigns.map(async (campaign) => {
        const organization = await this.prisma.$queryRaw<any[]>`
          SELECT name FROM auth_service.organizations WHERE id = ${campaign.organization_id}
        `;
        
        return {
          ...campaign,
          organizationName: organization[0]?.name || 'Unknown Organization',
        };
      })
    );
    
    return campaignsWithOrgNames;
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaigns.findUnique({
      where: { id },
    });
    
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    
    // Get organization details
    const organization = await this.prisma.$queryRaw<Organization[]>`
      SELECT id, name, description, logo_url, website, verification_status 
      FROM auth_service.organizations 
      WHERE id = ${campaign.organization_id}
    `;
    
    // Get proofs
    const proofs = await this.prisma.proofs.findMany({
      where: { campaign_id: id },
      orderBy: { created_at: 'desc' },
    });
    
    return {
      ...campaign,
      organization: organization[0] || null,
      proofs,
    };
  }

  async create(createCampaignDto: CreateCampaignDto, userId: string) {
    // Verify user is authorized for this organization
    const organization = await this.prisma.$queryRaw<Organization[]>`
      SELECT id FROM auth_service.organizations 
      WHERE id = ${createCampaignDto.organization_id} AND owner_id = ${userId}
    `;
    
    if (!organization[0]) {
      throw new ForbiddenException('You are not authorized to create campaigns for this organization');
    }
    
    // Upload image to IPFS if provided
    let ipfs_hash = null;
    if (createCampaignDto.image_data) {
      // Convert base64 to buffer
      const buffer = Buffer.from(createCampaignDto.image_data.split(',')[1], 'base64');
      ipfs_hash = await this.pinataService.uploadBuffer(buffer, `campaign-${Date.now()}`);
    }
    
    // Create campaign
    const campaign = await this.prisma.campaigns.create({
      data: {
        title: createCampaignDto.title,
        description: createCampaignDto.description,
        target_amount: createCampaignDto.target_amount,
        current_amount: 0,
        start_date: new Date(createCampaignDto.start_date),
        end_date: new Date(createCampaignDto.end_date),
        image_url: createCampaignDto.image_url || null,
        ipfs_hash: ipfs_hash,
        status: 'pending', // All campaigns start as pending until verified
        organization_id: createCampaignDto.organization_id,
      },
    });
    
    // Submit for verification automatically
    await this.submitForVerification(campaign.id, userId);
    
    return campaign;
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto, userId: string) {
    // Check if campaign exists
    const campaign = await this.prisma.campaigns.findUnique({
      where: { id },
    });
    
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    
    // Verify user is authorized for this organization
    const organization = await this.prisma.$queryRaw<Organization[]>`
      SELECT id FROM auth_service.organizations 
      WHERE id = ${campaign.organization_id} AND owner_id = ${userId}
    `;
    
    if (!organization[0]) {
      throw new ForbiddenException('You are not authorized to update this campaign');
    }
    
    // Upload new image to IPFS if provided
    let ipfs_hash = campaign.ipfs_hash;
    if (updateCampaignDto.image_data) {
      // Convert base64 to buffer
      const buffer = Buffer.from(updateCampaignDto.image_data.split(',')[1], 'base64');
      ipfs_hash = await this.pinataService.uploadBuffer(buffer, `campaign-${Date.now()}`);
    }
    
    // Update campaign
    return this.prisma.campaigns.update({
      where: { id },
      data: {
        title: updateCampaignDto.title || campaign.title,
        description: updateCampaignDto.description || campaign.description,
        target_amount: updateCampaignDto.target_amount || campaign.target_amount,
        end_date: updateCampaignDto.end_date ? new Date(updateCampaignDto.end_date) : campaign.end_date,
        image_url: updateCampaignDto.image_url || campaign.image_url,
        ipfs_hash: ipfs_hash,
      },
    });
  }

  async remove(id: string, userId: string) {
    // Check if campaign exists
    const campaign = await this.prisma.campaigns.findUnique({
      where: { id },
    });
    
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    
    // Verify user is authorized for this organization
    const organization = await this.prisma.$queryRaw<Organization[]>`
      SELECT id FROM auth_service.organizations 
      WHERE id = ${campaign.organization_id} AND owner_id = ${userId}
    `;
    
    if (!organization[0]) {
      throw new ForbiddenException('You are not authorized to delete this campaign');
    }
    
    // Delete campaign
    return this.prisma.campaigns.delete({
      where: { id },
    });
  }

  async findByOrganization(organizationId: string) {
    return this.prisma.campaigns.findMany({
      where: { organization_id: organizationId },
      orderBy: { created_at: 'desc' },
    });
  }

  async submitForVerification(id: string, userId: string) {
    // Check if campaign exists
    const campaign = await this.prisma.campaigns.findUnique({
      where: { id },
    });
    
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    
    // Verify user is authorized for this organization
    const organization = await this.prisma.$queryRaw<Organization[]>`
      SELECT id FROM auth_service.organizations 
      WHERE id = ${campaign.organization_id} AND owner_id = ${userId}
    `;
    
    if (!organization[0]) {
      throw new ForbiddenException('You are not authorized to submit this campaign for verification');
    }
    
    // Send verification request to verification service
    this.verificationClient.emit('verification.request', {
      entity_type: 'campaign',
      entity_id: id,
      requested_by: userId,
    });
    
    // Update campaign status to pending verification
    return this.prisma.campaigns.update({
      where: { id },
      data: { status: 'pending' },
    });
  }

  async getProofs(id: string) {
    // Check if campaign exists
    const campaign = await this.prisma.campaigns.findUnique({
      where: { id },
    });
    
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    
    // Get proofs
    return this.prisma.proofs.findMany({
      where: { campaign_id: id },
      orderBy: { created_at: 'desc' },
    });
  }

  async addProof(id: string, proofDto: ProofDto, userId: string) {
    // Check if campaign exists
    const campaign = await this.prisma.campaigns.findUnique({
      where: { id },
    });
    
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    
    // Verify user is authorized for this organization
    const organization = await this.prisma.$queryRaw<Organization[]>`
      SELECT id FROM auth_service.organizations 
      WHERE id = ${campaign.organization_id} AND owner_id = ${userId}
    `;
    
    if (!organization[0]) {
      throw new ForbiddenException('You are not authorized to add proof to this campaign');
    }
    
    // Upload proof document to IPFS
    let ipfs_hash = null;
    if (proofDto.document_data) {
      // Convert base64 to buffer
      const buffer = Buffer.from(proofDto.document_data.split(',')[1], 'base64');
      ipfs_hash = await this.pinataService.uploadBuffer(buffer, `proof-${Date.now()}`);
    }
    
    // Create proof
    const proof = await this.prisma.proofs.create({
      data: {
        campaign_id: id,
        description: proofDto.description,
        amount_used: proofDto.amount_used,
        ipfs_hash: ipfs_hash ?? '',
        status: 'pending', // All proofs start as pending until verified
        submitted_by: userId,
      },
    });
    
    // Send verification request to verification service
    this.verificationClient.emit('verification.request', {
      entity_type: 'proof',
      entity_id: proof.id,
      requested_by: userId,
    });
    
    return proof;
  }

  async requestFundRelease(id: string, fundReleaseDto: FundReleaseDto, userId: string) {
    // Check if campaign exists
    const campaign = await this.prisma.campaigns.findUnique({
      where: { id },
    });
    
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    
    // Verify user is authorized for this organization
    const organization = await this.prisma.$queryRaw<Organization[]>`
      SELECT id FROM auth_service.organizations 
      WHERE id = ${campaign.organization_id} AND owner_id = ${userId}
    `;
    
    if (!organization[0]) {
      throw new ForbiddenException('You are not authorized to request fund release for this campaign');
    }
    
    // Check if requested amount is available
    const currentAmount = typeof campaign.current_amount === 'object' && 'toNumber' in campaign.current_amount
      ? campaign.current_amount.toNumber()
      : Number(campaign.current_amount);
    if (fundReleaseDto.amount > currentAmount) {
      throw new ForbiddenException('Requested amount exceeds available funds');
    }
    
    // Create fund release request
    const fundReleaseRequest = await this.prisma.$queryRaw<FundReleaseRequest[]>`
      INSERT INTO verification_service.fund_release_requests (
        campaign_id, 
        organization_id, 
        amount, 
        purpose, 
        status, 
        requested_by
      ) VALUES (
        ${id}, 
        ${campaign.organization_id}, 
        ${fundReleaseDto.amount}, 
        ${fundReleaseDto.purpose}, 
        'pending', 
        ${userId}
      ) RETURNING *
    `;
    
    // Send verification request to verification service
    this.verificationClient.emit('fund_release.request', {
      fund_release_id: fundReleaseRequest[0].id,
      requested_by: userId,
    });
    
    return fundReleaseRequest[0];
  }
}
