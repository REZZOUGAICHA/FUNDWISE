import { Module } from '@nestjs/common';
import { PublicDonationStatsRepository } from './public-donation-stats.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PublicDonationStatsRepository],
  exports: [PublicDonationStatsRepository],
})
export class PublicDonationStatsModule {}