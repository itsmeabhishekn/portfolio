import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Public } from '../current-user/public.decorator.js';
import { HealthService } from './health.service.js';

class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status: 'ok';
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Public()
  @Get()
  @ApiOkResponse({ type: HealthResponseDto })
  async getHealth(): Promise<{ status: 'ok' }> {
    const ok = await this.health.check();
    if (!ok) {
      throw new ServiceUnavailableException('Service unavailable');
    }
    return { status: 'ok' };
  }
}
