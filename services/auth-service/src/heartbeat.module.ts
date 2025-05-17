import { Module } from '@nestjs/common';
import { HeartbeatService } from './heartbeat.service';

@Module({
  providers: [HeartbeatService],
})
export class HeartbeatModule {}
