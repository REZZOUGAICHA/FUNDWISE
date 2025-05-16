import { Module } from '@nestjs/common';
import { PinataService } from './pinata.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], 
  providers: [PinataService],
  exports: [PinataService],
})
export class IpfsModule {}
