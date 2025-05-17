import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VerificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingProofs() {
    return this.prisma.$queryRawUnsafe(
      `SELECT * FROM campaign_service.proofs WHERE status = 'pending'`
    );
  }

  async getPendingOrganizations() {
    return this.prisma.$queryRawUnsafe(
      `SELECT * FROM auth_service.organizations WHERE verification_status = 'pending'`
    );
  }

  async getPendingCampaigns() {
    return this.prisma.$queryRawUnsafe(
      `SELECT * FROM campaign_service.campaigns WHERE status = 'pending'`
    );
  }

  async approveOrganization(orgId: string) {
    return this.prisma.$executeRawUnsafe(
      `UPDATE auth_service.organizations SET verification_status = 'approved' WHERE id = $1::uuid`,
      orgId
    );
  }

  async approveCampaign(campaignId: string) {
    return this.prisma.$executeRawUnsafe(
      `UPDATE campaign_service.campaigns SET status = 'active' WHERE id = $1::uuid`,
      campaignId
    );
  }

  async approveProof(proofId: string) {
    return this.prisma.$executeRawUnsafe(
      `UPDATE campaign_service.proofs SET status = 'approved' WHERE id = $1::uuid`,
      proofId
    );
  }

  async rejectOrganization(orgId: string) {
    return this.prisma.$executeRawUnsafe(
      `UPDATE auth_service.organizations SET verification_status = 'refused' WHERE id = $1::uuid`,
      orgId
    );
  }

  async rejectCampaign(campaignId: string) {
    return this.prisma.$executeRawUnsafe(
      `UPDATE campaign_service.campaigns SET status = 'refused' WHERE id = $1::uuid`,
      campaignId
    );
  }

  async rejectProof(proofId: string) {
    return this.prisma.$executeRawUnsafe(
      `UPDATE campaign_service.proofs SET status = 'refused' WHERE id = $1::uuid`,
      proofId
    );
  }
}
