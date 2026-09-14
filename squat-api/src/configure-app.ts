import { RequestMethod, ValidationPipe, type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { parseCorsOrigins } from './config/env.js';

export function configureApp(app: INestApplication): void {
  const corsOrigins = parseCorsOrigins(
    process.env.CORS_ORIGINS ?? 'http://localhost:5173',
  );

  app.enableCors({ origin: corsOrigins });
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
      'Fitness tracking API. Requests currently run as the seeded development user.',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
}
