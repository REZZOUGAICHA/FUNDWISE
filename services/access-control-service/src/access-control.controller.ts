import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AccessControlService } from './access-control.service';

@Controller()
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}

  @Post('validate')
  async validate(@Body() body: any) {
    const allowed = await this.accessControlService.validateRequest(body);

    if (!allowed) {
      throw new UnauthorizedException('Access denied');
    }

    return { success: true };
  }
}
