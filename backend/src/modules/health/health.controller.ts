// backend/src/modules/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Health Check Controller
 * 
 * Предоставляет endpoint для проверки работоспособности сервиса.
 * Используется Docker для health checks и мониторинга.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'Проверка работоспособности сервиса' })
  @ApiResponse({
    status: 200,
    description: 'Сервис работает',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        uptime: { type: 'number', example: 12345.67 },
        environment: { type: 'string', example: 'production' },
      },
    },
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Проверка готовности сервиса' })
  @ApiResponse({
    status: 200,
    description: 'Сервис готов к приёму запросов',
  })
  ready() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }
}
