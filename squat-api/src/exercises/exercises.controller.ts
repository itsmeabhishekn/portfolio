import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ExerciseResponseDto } from '../workouts/dto/workout-response.dto.js';
import { ExercisesService } from './exercises.service.js';

@ApiTags('exercises')
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercises: ExercisesService) {}

  @Get()
  @ApiOperation({ summary: 'List the shared exercise catalog' })
  @ApiOkResponse({ type: [ExerciseResponseDto] })
  list(): Promise<ExerciseResponseDto[]> {
    return this.exercises.list();
  }

  @Get(':exerciseId')
  @ApiOperation({ summary: 'Get one catalog exercise' })
  @ApiOkResponse({ type: ExerciseResponseDto })
  @ApiNotFoundResponse({ description: 'Exercise not found' })
  getById(
    @Param('exerciseId', new ParseUUIDPipe({ version: '4' }))
    exerciseId: string,
  ): Promise<ExerciseResponseDto> {
    return this.exercises.getById(exerciseId);
  }
}
