import { Controller, Get } from '@nestjs/common';
import { Ping, PingSchema } from '@samyukt/contracts';

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): Ping {
    const payload = {
      status: 'ok' as const,
      version: '0.1.0',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };

    // Validates response through contracts schema
    return PingSchema.parse(payload);
  }
}

