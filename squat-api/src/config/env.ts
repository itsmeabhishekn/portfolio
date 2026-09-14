import { plainToInstance } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsString,
  Min,
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

  @IsEmail()
  DEV_USER_EMAIL: string;
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
      DEV_USER_EMAIL: config.DEV_USER_EMAIL,
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
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}
