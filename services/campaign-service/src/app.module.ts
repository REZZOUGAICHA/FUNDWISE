import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IpfsModule } from './ipfs/ipfs.module';
import { CampaignsModule } from './campaigns/campaigns.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    IpfsModule,
    CampaignsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
