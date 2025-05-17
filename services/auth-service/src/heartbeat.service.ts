import { Injectable, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Counter } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class HeartbeatService implements OnModuleInit {
  constructor(
    @InjectMetric('heartbeat_success_total')
    private heartbeatCounter: Counter<string>,
  ) {}

  onModuleInit() {
    this.sendHeartbeat(); // send once on startup
  }

  @Interval(10000)
  sendHeartbeat() {
    // Simulate heartbeat logic
    const success = true;

    if (success) {
      this.heartbeatCounter.inc(); // Increment Prometheus counter
      console.log('[Heartbeat] Success sent.');
    } else {
      console.log('[Heartbeat] Failure.');
    }
  }
}
