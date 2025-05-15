import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class VerificationsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.verificationsWhereInput;
    orderBy?: Prisma.verificationsOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.verifications.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async findById(id: string) {
    return this.prisma.verifications.findUnique({
      where: { id },
    });
  }

  async findByEntityId(entityId: string, entityType: string) {
    return this.prisma.verifications.findMany({
      where: { 
        entity_id: entityId,
        entity_type: entityType
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findByReviewerId(reviewerId: string) {
    return this.prisma.verifications.findMany({
      where: { reviewer_id: reviewerId },
    });
  }

  async findByRequesterId(requesterId: string) {
    return this.prisma.verifications.findMany({
      where: { requested_by: requesterId },
    });
  }

  async findPendingVerifications() {
    return this.prisma.verifications.findMany({
      where: { status: 'pending' },
    });
  }

  async create(data: Prisma.verificationsCreateInput) {
    return this.prisma.verifications.create({
      data,
    });
  }

  async update(id: string, data: Prisma.verificationsUpdateInput) {
    return this.prisma.verifications.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: string, reviewerId: string, notes?: string) {
    return this.prisma.verifications.update({
      where: { id },
      data: { 
        status,
        reviewer_id: reviewerId,
        review_notes: notes,
        updated_at: new Date()
      },
    });
  }

  async delete(id: string) {
    return this.prisma.verifications.delete({
      where: { id },
    });
  }
}
