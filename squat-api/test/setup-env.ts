import 'reflect-metadata';

process.env.NODE_ENV ??= 'test';
process.env.PORT ??= '3001';
process.env.CORS_ORIGINS ??= 'http://localhost:5173';
process.env.GOOGLE_CLIENT_ID ??= 'test-google-client-id.apps.googleusercontent.com';
process.env.SESSION_JWT_SECRET ??= 'test-session-secret-at-least-32-chars-long';
process.env.DATABASE_URL ??=
  process.env.TEST_DATABASE_URL ??
  'postgresql://squat:squat@localhost:5433/squat?schema=public';
