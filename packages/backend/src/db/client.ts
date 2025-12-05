import { Pool, type PoolClient, type PoolConfig } from 'pg';

import { env } from '../lib/env.js';

let pool: Pool | null = null;

const poolConfig: PoolConfig = {
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
};

const redactConnectionString = (connectionString: string): string => {
  try {
    const url = new URL(connectionString);
    if (url.password) {
      url.password = '***';
    }
    return url.toString();
  } catch {
    return connectionString.replace(/\/\/([^:]+):[^@]*@/u, '//$1:***@');
  }
};

const logConnectionError = (error: unknown): void => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  // eslint-disable-next-line no-console
  console.error('Database connection error', {
    message,
    connectionString: redactConnectionString(env.DATABASE_URL),
  });
};

export const getPool = (): Pool => {
  if (pool) return pool;

  pool = new Pool(poolConfig);
  pool.on('error', (error) => {
    logConnectionError(error);
  });

  return pool;
};

export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

export const checkDatabaseConnection = async (): Promise<void> => {
  const dbPool = getPool();
  let client: PoolClient | null = null;

  try {
    client = await dbPool.connect();
    await client.query('SELECT 1');
  } finally {
    client?.release();
  }
};

export const initializeDatabase = async (): Promise<void> => {
  try {
    await checkDatabaseConnection();
  } catch (error) {
    logConnectionError(error);
    if (env.NODE_ENV === 'test') {
      throw error;
    }
    process.exitCode = 1;
    // eslint-disable-next-line no-console
    console.error('Exiting because database is unreachable.');
    process.exit();
  }
};
