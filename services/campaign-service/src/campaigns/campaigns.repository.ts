import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CampaignsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.campaignsWhereInput;
    orderBy?: Prisma.campaignsOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.campaigns.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        proofs: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.campaigns.findUnique({
      where: { id },
      include: {
        proofs: true,
      },
    });
  }

  async findByOrganizationId(organizationId: string) {
    return this.prisma.campaigns.findMany({
      where: { organization_id: organizationId },
      include: {
        proofs: true,
      },
    });
  }

  async create(data: Prisma.campaignsCreateInput) {
    return this.prisma.campaigns.create({
      data,
      include: {
        proofs: true,
      },
    });
  }

  async update(id: string, data: Prisma.campaignsUpdateInput) {
    return this.prisma.campaigns.update({
      where: { id },
      data,
      include: {
        proofs: true,
      },
    });
  }

  async updateFundingAmount(id: string, currentAmount: number) {
    return this.prisma.campaigns.update({
      where: { id },
      data: { current_amount: currentAmount },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.campaigns.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    return this.prisma.campaigns.delete({
      where: { id },
    });
  }
}
