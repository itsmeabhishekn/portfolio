import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../current-user/current-user.decorator.js';
import type { AuthenticatedUser } from '../current-user/current-user.service.js';
import { WorkoutSessionsService } from '../workout-sessions/workout-sessions.service.js';
import { WorkoutSessionResponseDto } from '../workout-sessions/dto/session-response.dto.js';
import { WorkoutTemplateResponseDto } from './dto/workout-response.dto.js';
import { WorkoutsService } from './workouts.service.js';

@ApiTags('workouts')
@Controller('workouts')
export class WorkoutsController {
  constructor(
    private readonly workouts: WorkoutsService,
    private readonly sessions: WorkoutSessionsService,
  ) {}

  @Get('upcoming')
  @ApiOperation({ summary: 'Get the current user upcoming workout template' })
  @ApiOkResponse({ type: WorkoutTemplateResponseDto })
  @ApiNotFoundResponse({ description: 'No upcoming workout' })
  getUpcoming(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkoutTemplateResponseDto> {
    return this.workouts.getUpcoming(user.id);
  }

  @Get(':workoutId')
  @ApiOperation({ summary: 'Get a planned workout template' })
  @ApiOkResponse({ type: WorkoutTemplateResponseDto })
  getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workoutId', new ParseUUIDPipe({ version: '4' }))
    workoutId: string,
  ): Promise<WorkoutTemplateResponseDto> {
    return this.workouts.getById(workoutId, user.id);
  }

  @Get(':workoutId/sessions/in-progress')
  @ApiOperation({
    summary: 'Get the in-progress session for a workout if one exists',
  })
  @ApiOkResponse({ type: WorkoutSessionResponseDto })
  @ApiNotFoundResponse({ description: 'No in-progress session' })
  getInProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workoutId', new ParseUUIDPipe({ version: '4' }))
    workoutId: string,
  ): Promise<WorkoutSessionResponseDto> {
    return this.sessions.getInProgress(workoutId, user.id);
  }

  @Post(':workoutId/sessions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Start a workout or resume the existing in-progress session',
  })
  @ApiOkResponse({ type: WorkoutSessionResponseDto })
  start(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workoutId', new ParseUUIDPipe({ version: '4' }))
    workoutId: string,
  ): Promise<WorkoutSessionResponseDto> {
    return this.sessions.startOrResume(workoutId, user.id);
  }
}
