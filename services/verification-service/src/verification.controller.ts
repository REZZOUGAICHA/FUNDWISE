import { Controller, Get, Query, Patch } from '@nestjs/common';
import { VerificationService } from './verification.service';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('pending')
  async getAllPending() {
    const [ngos, campaigns, proofs] = await Promise.all([
      this.verificationService.getPendingOrganizations(),
      this.verificationService.getPendingCampaigns(),
      this.verificationService.getPendingProofs(),
    ]);

    return { ngos, campaigns, proofs };
  }

  @Patch('approve/organization')
  approveOrganization(@Query('id') id: string) {
    return this.verificationService.approveOrganization(id);
  }

  @Patch('approve/campaign')
  approveCampaign(@Query('id') id: string) {
    return this.verificationService.approveCampaign(id);
  }

  @Patch('approve/proof')
  approveProof(@Query('id') id: string) {
    return this.verificationService.approveProof(id);
  }
}
