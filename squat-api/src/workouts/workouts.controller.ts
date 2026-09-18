import {
  Body,
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
import type { AuthenticatedUser } from '../current-user/authenticated-user.js';
import { WorkoutSessionsService } from '../workout-sessions/workout-sessions.service.js';
import { WorkoutSessionResponseDto } from '../workout-sessions/dto/session-response.dto.js';
import { ChooseUpcomingDto } from './dto/choose-upcoming.dto.js';
import {
  WorkoutSummaryDto,
  WorkoutTemplateResponseDto,
} from './dto/workout-response.dto.js';
import { WorkoutsService } from './workouts.service.js';

@ApiTags('workouts')
@Controller('workouts')
export class WorkoutsController {
  constructor(
    private readonly workouts: WorkoutsService,
    private readonly sessions: WorkoutSessionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List workout templates on the active program' })
  @ApiOkResponse({ type: [WorkoutSummaryDto] })
  list(@CurrentUser() user: AuthenticatedUser): Promise<WorkoutSummaryDto[]> {
    return this.workouts.listForUser(user.id);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get the current user upcoming workout template' })
  @ApiOkResponse({ type: WorkoutTemplateResponseDto })
  @ApiNotFoundResponse({ description: 'No upcoming workout' })
  getUpcoming(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkoutTemplateResponseDto> {
    return this.workouts.getUpcoming(user.id);
  }

  @Post('upcoming/skip')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Skip the current suggested day without logging a session',
  })
  @ApiOkResponse({ type: WorkoutTemplateResponseDto })
  skipUpcoming(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkoutTemplateResponseDto> {
    return this.workouts.skipUpcoming(user.id);
  }

  @Post('upcoming/choose')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Train a different program day today without skipping the queued day',
  })
  @ApiOkResponse({ type: WorkoutTemplateResponseDto })
  chooseUpcoming(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ChooseUpcomingDto,
  ): Promise<WorkoutTemplateResponseDto> {
    return this.workouts.chooseUpcoming(user.id, body.workoutId);
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
