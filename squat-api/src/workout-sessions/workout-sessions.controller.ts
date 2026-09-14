import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../current-user/current-user.decorator.js';
import type { AuthenticatedUser } from '../current-user/authenticated-user.js';
import { UpdateSetDto } from './dto/update-set.dto.js';
import { WorkoutSessionResponseDto } from './dto/session-response.dto.js';
import { WorkoutSessionsService } from './workout-sessions.service.js';

@ApiTags('workout-sessions')
@Controller('workout-sessions')
export class WorkoutSessionsController {
  constructor(private readonly sessions: WorkoutSessionsService) {}

  @Get(':sessionId')
  @ApiOperation({ summary: 'Get a performed workout session' })
  @ApiOkResponse({ type: WorkoutSessionResponseDto })
  getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId', new ParseUUIDPipe({ version: '4' }))
    sessionId: string,
  ): Promise<WorkoutSessionResponseDto> {
    return this.sessions.getById(sessionId, user.id);
  }

  @Patch(':sessionId/sets/:setId')
  @ApiOperation({ summary: 'Update or complete a performed set' })
  @ApiOkResponse({ type: WorkoutSessionResponseDto })
  updateSet(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId', new ParseUUIDPipe({ version: '4' }))
    sessionId: string,
    @Param('setId', new ParseUUIDPipe({ version: '4' }))
    setId: string,
    @Body() dto: UpdateSetDto,
  ): Promise<WorkoutSessionResponseDto> {
    return this.sessions.updateSet(sessionId, setId, user.id, dto);
  }

  @Post(':sessionId/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark an in-progress session as completed' })
  @ApiOkResponse({ type: WorkoutSessionResponseDto })
  complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId', new ParseUUIDPipe({ version: '4' }))
    sessionId: string,
  ): Promise<WorkoutSessionResponseDto> {
    return this.sessions.complete(sessionId, user.id);
  }
}
