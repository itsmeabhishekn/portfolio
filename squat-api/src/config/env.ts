import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsString,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export class EnvironmentVariables {
  @IsIn(['development', 'test', 'production'])
  NODE_ENV: string;

  @IsInt()
  @Min(1)
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  CORS_ORIGINS: string;

  @IsString()
  @MinLength(1)
  GOOGLE_CLIENT_ID: string;

  @IsString()
  @MinLength(32)
  SESSION_JWT_SECRET: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(
    EnvironmentVariables,
    {
      NODE_ENV: config.NODE_ENV,
      PORT: config.PORT,
      DATABASE_URL: config.DATABASE_URL,
      CORS_ORIGINS: config.CORS_ORIGINS,
      GOOGLE_CLIENT_ID: config.GOOGLE_CLIENT_ID,
      SESSION_JWT_SECRET: config.SESSION_JWT_SECRET,
    },
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  return validated;
}

export function parseCorsOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter((origin) => origin.length > 0);
}
