import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BrokerService } from './broker.service';
import { HeartbeatService } from './heartbeat.service';
import { PrometheusModule, makeCounterProvider } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [PrometheusModule.register()],
  controllers: [AuthController],
  providers: [
    AuthService,
    BrokerService,
    HeartbeatService,
    makeCounterProvider({
      name: 'heartbeat_success_total',
      help: 'Total number of successful heartbeat pings',
    }),
  ],
})
export class AuthModule {}
