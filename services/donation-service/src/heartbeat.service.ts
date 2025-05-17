import { Injectable, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Counter } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class HeartbeatService implements OnModuleInit {
  constructor(
    @InjectMetric('donation_heartbeat_success_total')
    private readonly heartbeatCounter: Counter<string>,
  ) {}

  onModuleInit() {
    this.sendHeartbeat(); // send once on startup
  }

  @Interval(10000)
  sendHeartbeat() {
    try {
      this.heartbeatCounter.inc(); // Increment Prometheus counter
      console.log('[Donation Heartbeat] Success sent.');
    } catch (error) {
      console.error('[Donation Heartbeat] Error:', error);
    }
  }
} 