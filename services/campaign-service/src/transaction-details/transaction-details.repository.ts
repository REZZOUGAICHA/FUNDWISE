import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionDetailsRepository {
  constructor(private prisma: PrismaService) {}

  // Due to the privacy design, this repository should be used with caution
  // and should not expose methods that could compromise donor privacy
  async findById(id: string) {
    return this.prisma.transaction_details.findUnique({
      where: { id },
    });
  }

  async findByCampaignId(campaignId: string) {
    // Only returns transaction details without donor information
    return this.prisma.transaction_details.findMany({
      where: { campaign_id: campaignId },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findByTransactionHash(transactionHash: string) {
    return this.prisma.transaction_details.findUnique({
      where: { transaction_hash: transactionHash },
    });
  }

  async create(data: Prisma.transaction_detailsCreateInput) {
    return this.prisma.transaction_details.create({
      data,
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.transaction_details.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    return this.prisma.transaction_details.delete({
      where: { id },
    });
  }
}
