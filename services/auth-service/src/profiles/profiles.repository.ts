import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProfilesRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.profiles.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.profiles.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.profilesCreateInput) {
    return this.prisma.profiles.create({
      data,
    });
  }

  async update(id: string, data: Prisma.profilesUpdateInput) {
    return this.prisma.profiles.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.profiles.delete({
      where: { id },
    });
  }

  async updateWalletAddress(id: string, walletAddress: string) {
    return this.prisma.profiles.update({
      where: { id },
      data: {
        encrypted_wallet_address: walletAddress,
        wallet_address: null, // Clear plaintext field
      },
    });
  }

  async findWithOrganizations(id: string) {
    return this.prisma.profiles.findUnique({
      where: { id },
      include: {
        organizations: true,
      },
    });
  }
}
