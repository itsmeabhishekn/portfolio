import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ChooseUpcomingDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  workoutId: string;
}
