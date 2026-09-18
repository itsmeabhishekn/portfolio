import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../current-user/current-user.decorator.js';
import type { AuthenticatedUser } from '../current-user/authenticated-user.js';
import {
  ProgramDetailDto,
  ProgramListItemDto,
} from '../workouts/dto/workout-response.dto.js';
import { ProgramsService } from './programs.service.js';

@ApiTags('programs')
@Controller('programs')
export class ProgramsController {
  constructor(private readonly programs: ProgramsService) {}

  @Get()
  @ApiOperation({ summary: 'List programs for the current user' })
  @ApiOkResponse({ type: [ProgramListItemDto] })
  list(@CurrentUser() user: AuthenticatedUser): Promise<ProgramListItemDto[]> {
    return this.programs.listForUser(user.id);
  }

  @Get(':programId')
  @ApiOperation({ summary: 'Get one program and its workout templates' })
  @ApiOkResponse({ type: ProgramDetailDto })
  @ApiNotFoundResponse({ description: 'Program not found' })
  getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('programId', new ParseUUIDPipe({ version: '4' }))
    programId: string,
  ): Promise<ProgramDetailDto> {
    return this.programs.getById(programId, user.id);
  }
}
