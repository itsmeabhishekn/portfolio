import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleSignInDto {
  @ApiProperty({
    description: 'ID token issued by Google Identity Services',
  })
  @IsString()
  @IsNotEmpty()
  credential: string;
}
