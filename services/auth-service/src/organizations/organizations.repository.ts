import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrganizationsRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.organizations.findUnique({
      where: { id },
    });
  }

  async findByOwnerId(ownerId: string) {
    return this.prisma.organizations.findMany({
      where: { owner_id: ownerId },
    });
  }

  async create(data: Prisma.organizationsCreateInput) {
    return this.prisma.organizations.create({
      data,
    });
  }

  async update(id: string, data: Prisma.organizationsUpdateInput) {
    return this.prisma.organizations.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.organizations.delete({
      where: { id },
    });
  }

  async updateWalletAddress(id: string, walletAddress: string) {
    return this.prisma.organizations.update({
      where: { id },
      data: {
        encrypted_wallet_address: walletAddress,
        wallet_address: '', // Clear plaintext field
      },
    });
  }

  async updateVerificationStatus(id: string, status: string) {
    return this.prisma.organizations.update({
      where: { id },
      data: {
        verification_status: status,
        updated_at: new Date(),
      },
    });
  }

  async findWithOwner(id: string) {
    return this.prisma.organizations.findUnique({
      where: { id },
      include: {
        owner: true,
      },
    });
  }

  async findByVerificationStatus(status: string) {
    return this.prisma.organizations.findMany({
      where: { verification_status: status },
    });
  }
}
