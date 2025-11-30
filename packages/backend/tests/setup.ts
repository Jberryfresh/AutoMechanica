import dotenv from 'dotenv';

dotenv.config({ path: process.env.ENV_FILE_PATH ?? '.env' });
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
process.env.BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgres://user:password@localhost:5432/automechanica';
process.env.PORT = process.env.PORT ?? '3001';
