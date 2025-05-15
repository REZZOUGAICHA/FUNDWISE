import { Module } from '@nestjs/common';
import { ProofsRepository } from './proofs.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProofsRepository],
  exports: [ProofsRepository],
})
export class ProofsModule {}