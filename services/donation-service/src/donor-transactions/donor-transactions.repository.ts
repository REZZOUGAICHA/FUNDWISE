import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DonorTransactionsRepository {
  constructor(private prisma: PrismaService) {}

  // This repository should only be used by the donor themselves
  // due to privacy concerns
  async findByDonorId(donorId: string) {
    return this.prisma.donor_transactions.findMany({
      where: { donor_id: donorId },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.donor_transactions.findUnique({
      where: { id },
    });
  }

  async findByTransactionId(transactionId: string) {
    return this.prisma.donor_transactions.findUnique({
      where: { transaction_id: transactionId },
    });
  }

  async create(data: Prisma.donor_transactionsCreateInput) {
    return this.prisma.donor_transactions.create({
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.donor_transactions.delete({
      where: { id },
    });
  }
}
