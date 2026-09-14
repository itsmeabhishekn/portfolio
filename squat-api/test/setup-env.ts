import 'reflect-metadata';

process.env.NODE_ENV ??= 'test';
process.env.PORT ??= '3001';
process.env.CORS_ORIGINS ??= 'http://localhost:5173';
process.env.DEV_USER_EMAIL ??= 'alex@squat.app';
process.env.DATABASE_URL ??=
  process.env.TEST_DATABASE_URL ??
  'postgresql://squat:squat@localhost:5433/squat?schema=public';
