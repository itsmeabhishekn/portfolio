import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  displayName: string;
}

export class AuthSessionDto {
  @ApiProperty({ description: 'Send as `Authorization: Bearer <token>`' })
  token: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}
