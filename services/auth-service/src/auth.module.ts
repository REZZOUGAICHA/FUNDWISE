import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BrokerService } from './broker.service';  // <-- import BrokerService class

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, BrokerService], // <-- provide BrokerService here
})
export class AuthModule {}
