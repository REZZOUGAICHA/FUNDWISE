import { Module } from '@nestjs/common';
import { BrokerService } from './broker.service';

@Module({
  providers: [BrokerService],
  exports: [BrokerService],
})
export class BrokerModule {} 