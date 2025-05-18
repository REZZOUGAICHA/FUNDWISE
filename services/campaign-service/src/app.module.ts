import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DonationsModule } from './donations.module';
import { HeartbeatService } from './heartbeat.service';
import { MetricsModule } from './metrics.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MetricsModule,
    DonationsModule,
  ],
  providers: [HeartbeatService],
})
export class AppModule {}