// services/campaign-service/src/campaign/campaigns.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { CampaignService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';
import { ProofDto } from './dto/proof.dto';
import { FundReleaseDto } from './dto/fund-release.dto';
import { FundReleaseRequest } from './campaigns.service';

// Define a type for the user in the request
interface RequestWithUser extends Request {
  user: {
    id: string;
    role: string;
  };
}

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  async findAll(@Query('status') status?: string, @Query('organizationId') organizationId?: string) {
    return this.campaignService.findAll(status, organizationId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.campaignService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organization')
  async create(@Body() createCampaignDto: CreateCampaignDto, @Req() req: RequestWithUser) {
    return this.campaignService.create(createCampaignDto, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organization')
  async update(@Param('id') id: string, @Body() updateCampaignDto: UpdateCampaignDto, @Req() req: RequestWithUser) {
    return this.campaignService.update(id, updateCampaignDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organization', 'admin')
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.campaignService.remove(id, req.user.id);
  }

  // This route needs to be placed after the :id routes to avoid conflicts
  @Get('organization/:organizationId')
  async findByOrganization(@Param('organizationId') organizationId: string) {
    return this.campaignService.findByOrganization(organizationId);
  }

  @Post(':id/submit-for-verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organization')
  async submitForVerification(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.campaignService.submitForVerification(id, req.user.id);
  }

  @Post(':id/proof')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organization')
  async addProof(@Param('id') id: string, @Body() proofDto: ProofDto, @Req() req: RequestWithUser) {
    return this.campaignService.addProof(id, proofDto, req.user.id);
  }

  @Get(':id/proofs')
  async getProofs(@Param('id') id: string) {
    return this.campaignService.getProofs(id);
  }

  @Post(':id/fund-release')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async requestFundRelease(
    @Param('id') id: string,
    @Body() fundReleaseDto: FundReleaseDto,
    @Req() req: RequestWithUser
  ): Promise<FundReleaseRequest> {
    return this.campaignService.requestFundRelease(id, fundReleaseDto, req.user.id);
  }
  }

