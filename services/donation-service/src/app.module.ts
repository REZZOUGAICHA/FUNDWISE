import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DonationsModule } from './donations.module';

@Module({
  imports: [PrismaModule, DonationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}