import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BrokerService } from './broker.service'; // add this import

@Injectable()
export class AuthService {
  constructor(private readonly brokerService: BrokerService) {}

  async auth(email: string, password: string) {
    if (email === 'admin@fundwise.org' && password === 'password') {
      const user = { email };

      // Example: Send login event to other service
      await this.brokerService.publish('auth', { user });

      return { token: 'some-jwt-token', user };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
