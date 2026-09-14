import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../current-user/current-user.decorator.js';
import type { AuthenticatedUser } from '../current-user/authenticated-user.js';
import { Public } from '../current-user/public.decorator.js';
import { AuthService } from './auth.service.js';
import { AuthSessionDto, AuthUserDto } from './dto/auth-response.dto.js';
import { GoogleSignInDto } from './dto/google-sign-in.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Exchange a Google ID token for a Squat session token',
  })
  @ApiOkResponse({ type: AuthSessionDto })
  @ApiUnauthorizedResponse({ description: 'Google credential is not valid' })
  signInWithGoogle(@Body() dto: GoogleSignInDto): Promise<AuthSessionDto> {
    return this.auth.signInWithGoogle(dto.credential);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user' })
  @ApiOkResponse({ type: AuthUserDto })
  me(@CurrentUser() user: AuthenticatedUser): AuthUserDto {
    return user;
  }
}
