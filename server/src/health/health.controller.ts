import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/api-public.decorator';

@Controller()
export class HealthController {
  @Get('health')
  @Public()
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'trendmonitor-backend',
    };
  }
}
