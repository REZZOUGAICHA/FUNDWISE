import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('ACCESS_CONTROL_SERVICE') private readonly accessControlClient: ClientProxy,
    @Inject('VERIFICATION_SERVICE') private readonly verificationClient: ClientProxy,
  ) {}

  async redirectToAuthService(pattern: string, data: any): Promise<any> {
    try {
      return await firstValueFrom(this.authClient.send(pattern, data));
    } catch (error: unknown) {
  if (error instanceof Error) {
    throw new Error(`Service Error: ${error.message}`);
  }
  throw new Error('An unknown error occurred');
}
  }

  async redirectToAccessControlService(pattern: string, data: any): Promise<any> {
    try {
      return await firstValueFrom(this.accessControlClient.send(pattern, data));
    } catch (error: unknown) {
  if (error instanceof Error) {
    throw new Error(`Service Error: ${error.message}`);
  }
  throw new Error('An unknown error occurred');
}
  }

  async redirectToVerificationService(pattern: string, data: any): Promise<any> {
    try {
      return await firstValueFrom(this.verificationClient.send(pattern, data));
    } catch (error: unknown) {
  if (error instanceof Error) {
    throw new Error(`Service Error: ${error.message}`);
  }
  throw new Error('An unknown error occurred');
}
  }
}