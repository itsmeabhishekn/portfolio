import {
  Logger,
  RequestMethod,
  ValidationPipe,
  type INestApplication,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { parseCorsOrigins } from './config/env.js';

const corsLogger = new Logger('CORS');

export function configureApp(app: INestApplication): void {
  const corsOrigins = parseCorsOrigins(
    process.env.CORS_ORIGINS ?? 'http://localhost:5173',
  );
  const allowed = new Set(corsOrigins);
  corsLogger.log(`Allowed origins: ${corsOrigins.join(', ')}`);

  app.enableCors({
    origin: (origin, callback) => {
      if (origin === undefined || allowed.has(origin)) {
        callback(null, true);
        return;
      }
      corsLogger.warn(`Blocked origin: ${origin}`);
      callback(null, false);
    },
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Accept', 'Content-Type', 'Authorization'],
    maxAge: 86400,
  });
  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: 'health', method: RequestMethod.ALL },
      { path: 'api/docs', method: RequestMethod.ALL },
      { path: 'api/docs-json', method: RequestMethod.ALL },
    ],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Squat API')
    .setDescription(
      'Fitness tracking API. Sign in at POST /api/v1/auth/google, then send the returned token as a bearer token.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
}
