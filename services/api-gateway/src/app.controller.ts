import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Auth Service Routes
  @Post('auth/login')
  async login(@Body() loginDto: any) {
    return this.appService.redirectToAuthService('login', loginDto);
  }

  @Post('auth/register')
  async register(@Body() registerDto: any) {
    return this.appService.redirectToAuthService('register', registerDto);
  }

  @Post('auth/logout')
  async logout(@Body() logoutDto: any) {
    return this.appService.redirectToAuthService('logout', logoutDto);
  }

  // Access Control Service Routes
  @Get('access/roles')
  async getRoles(@Req() request: Request) {
    const userId = request.headers['user-id'];
    return this.appService.redirectToAccessControlService('get-roles', { userId });
  }

  @Post('access/check-permission')
  async checkPermission(@Body() permissionDto: any) {
    return this.appService.redirectToAccessControlService('check-permission', permissionDto);
  }

  // Verification Service Routes
  @Post('verification/verify-document')
  async verifyDocument(@Body() documentDto: any) {
    return this.appService.redirectToVerificationService('verify-document', documentDto);
  }

  @Get('verification/status/:id')
  async getVerificationStatus(@Req() request: Request) {
    const verificationId = request.params.id;
    return this.appService.redirectToVerificationService('verification-status', { verificationId });
  }

  @Post('verification/submit-proof')
  async submitProof(@Body() proofDto: any) {
    return this.appService.redirectToVerificationService('submit-proof', proofDto);
  }
}