import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  async auth(email: string, password: string) {
    if (email === 'admin@fundwise.org' && password === 'password') {
      return { token: 'some-jwt-token', user: { email } };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}