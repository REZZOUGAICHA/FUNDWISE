import { Module } from '@nestjs/common';
import { ProfilesRepository } from './profiles.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProfilesRepository],
  exports: [ProfilesRepository],
})
export class ProfilesModule {}
