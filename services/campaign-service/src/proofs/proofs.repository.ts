import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProofsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.proofsWhereInput;
    orderBy?: Prisma.proofsOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.proofs.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        campaign: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.proofs.findUnique({
      where: { id },
      include: {
        campaign: true,
      },
    });
  }

  async findByCampaignId(campaignId: string) {
    return this.prisma.proofs.findMany({
      where: { campaign_id: campaignId },
      include: {
        campaign: true,
      },
    });
  }

  async create(data: Prisma.proofsCreateInput) {
    return this.prisma.proofs.create({
      data,
      include: {
        campaign: true,
      },
    });
  }

  async update(id: string, data: Prisma.proofsUpdateInput) {
    return this.prisma.proofs.update({
      where: { id },
      data,
      include: {
        campaign: true,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.proofs.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    return this.prisma.proofs.delete({
      where: { id },
    });
  }
}
