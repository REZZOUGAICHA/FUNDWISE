import { Module } from '@nestjs/common';
import { PrometheusModule, makeCounterProvider } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    makeCounterProvider({
      name: 'donation_heartbeat_success_total',
      help: 'Total number of successful heartbeats from donation service',
      labelNames: ['service'],
    }),
  ],
  exports: [
    PrometheusModule,
    makeCounterProvider({
      name: 'donation_heartbeat_success_total',
      help: 'Total number of successful heartbeats from donation service',
      labelNames: ['service'],
    }),
  ],
})
export class MetricsModule {} 