import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { IpfsModule } from '../ipfs/ipfs.module';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [PrismaModule, IpfsModule, AuthModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
