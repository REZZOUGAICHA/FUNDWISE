import { Controller, Post, UseInterceptors, UploadedFile, Body, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CampaignsService } from './campaigns/campaigns.service';
import { CreateCampaignDto, ProofSubmissionDto } from './types/campaign.types';

@Controller()
export class AppController  {
  constructor(private campaignsService: CampaignsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createCampaign(
    @Body() campaignData: CreateCampaignDto, 
    @UploadedFile() image: Express.Multer.File
  ) {
    return this.campaignsService.createCampaign(campaignData, image.buffer);
  }

  @Post(':id/proofs')
  @UseInterceptors(FileInterceptor('document'))
  async addProof(
    @Param('id') campaignId: string,
    @Body() proofData: ProofSubmissionDto,
    @UploadedFile() document: Express.Multer.File
  ) {
    return this.campaignsService.addProofOfFundUsage(
      campaignId,
      proofData,
      document.buffer
    );
  }
}
