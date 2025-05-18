import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Define custom types to replace Prisma generated types
type PublicDonationStatsWhereInput = {
  id?: string;
  campaign_id?: string;
  amount?: number | string | Decimal | { 
    gt?: number | string | Decimal;
    gte?: number | string | Decimal;
    lt?: number | string | Decimal;
    lte?: number | string | Decimal;
  };
  created_at?: Date | { 
    gt?: Date;
    gte?: Date;
    lt?: Date;
    lte?: Date;
  };
};

type PublicDonationStatsOrderByInput = {
  id?: 'asc' | 'desc';
  campaign_id?: 'asc' | 'desc';
  amount?: 'asc' | 'desc';
  created_at?: 'asc' | 'desc';
};

type PublicDonationStatsCreateInput = {
  campaign_id: string;
  amount: number | string | Decimal;
};

@Injectable()
export class PublicDonationStatsRepository {
  constructor(private prisma: PrismaService) {}

  // This repository is for public stats that don't reveal donor identity
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: PublicDonationStatsWhereInput;
    orderBy?: PublicDonationStatsOrderByInput;
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

  async create(data: PublicDonationStatsCreateInput) {
    return this.prisma.public_donation_stats.create({
      data,
    });
  }
}