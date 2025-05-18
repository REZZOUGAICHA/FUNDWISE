// app.controller.ts
import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}
  
  @Post('auth/login')
  async auth(@Body() body: { email: string; password: string }): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      this.logger.log(`Auth called with body: ${JSON.stringify(body)}`);
      const result = await this.appService.auth(body.email, body.password);
      return { success: true, token: result.token };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('auth/signup')
  async signup(@Body() body: any): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
    try {
      this.logger.log(`Signup called with body: ${JSON.stringify(body)}`);
      const result = await this.appService.signup(body);
      return { 
        success: true, 
        token: result.token,
        user: result.user
      };
    } catch (error) {
      this.logger.error(`Signup error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

  