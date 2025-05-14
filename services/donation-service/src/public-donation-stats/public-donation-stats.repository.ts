import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PublicDonationStatsRepository {
  constructor(private prisma: PrismaService) {}

  // This repository is for public stats that don't reveal donor identity
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.public_donation_statsWhereInput;
    orderBy?: Prisma.public_donation_statsOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.public_donation_stats.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async findByCampaignId(campaignId: string) {
    return this.prisma.public_donation_stats.findMany({
      where: { campaign_id: campaignId },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async getTotalDonationsByCampaignId(campaignId: string) {
    const result = await this.prisma.public_donation_stats.aggregate({
      where: { campaign_id: campaignId },
      _sum: {
        amount: true,
      },
      _count: true,
    });
    
    return {
      totalAmount: result._sum.amount || 0,
      donationCount: result._count || 0,
    };
  }

  async create(data: Prisma.public_donation_statsCreateInput) {
    return this.prisma.public_donation_stats.create({
      data,
    });
  }
}
