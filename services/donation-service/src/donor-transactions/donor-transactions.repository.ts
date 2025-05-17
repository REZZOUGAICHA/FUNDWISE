import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

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

  async create(data: {
    donor_id: string;
    transaction_id: string;
    details: {
      amount: number | string | Decimal;
      campaign_id: string;
      transaction_hash: string;
      payment_method: string;
      message?: string;
      encrypted_amount?: string;
      status?: string;
    }
  }) {
    // Create both records in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // First create the transaction details
      const transactionDetails = await prisma.transaction_details.create({
        data: {
          id: data.transaction_id, // Use the same ID to link the records
          amount: data.details.amount,
          campaign_id: data.details.campaign_id,
          transaction_hash: data.details.transaction_hash,
          payment_method: data.details.payment_method,
          message: data.details.message,
          encrypted_amount: data.details.encrypted_amount,
          status: data.details.status || 'pending',
        }
      });

      // Then create the donor transaction
      return prisma.donor_transactions.create({
        data: {
          donor_id: data.donor_id,
          transaction_id: data.transaction_id,
        },
        include: {
          details: true
        }
      });
    });
  }

  async delete(id: string) {
    return this.prisma.donor_transactions.delete({
      where: { id },
    });
  }
}