import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async auth(@Body() body: { email: string; password: string }): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const result = await this.authService.auth(body.email, body.password);
      return { success: true, token: result.token };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
