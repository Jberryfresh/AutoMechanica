import { Pool, type PoolClient, type PoolConfig } from 'pg';

import { env } from '../lib/env.js';
import { logger } from '../lib/logger.js';

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
  logger.error(
    {
      connectionString: redactConnectionString(env.DATABASE_URL),
      err: error instanceof Error ? error : undefined,
    },
    `Database connection error: ${message}`
  );
};

export const getPool = (): Pool => {
  if (pool) return pool;

  pool = new Pool(poolConfig);
  const slowQueryThresholdMs = env.SLOW_QUERY_THRESHOLD_MS;

  const originalQuery = pool.query.bind(pool);
  // Wrap pool.query to emit timing for slow queries.
  pool.query = ((text: unknown, params?: unknown[]) => {
    const start = performance.now();
    return originalQuery(text as string, params).then((result) => {
      const duration = performance.now() - start;
      if (duration >= slowQueryThresholdMs && typeof text === 'string') {
        logger.warn(
          {
            durationMs: Number(duration.toFixed(2)),
            query: text.split('\n').join(' ').slice(0, 200),
          },
          'Slow query detected'
        );
      }
      return result;
    });
  }) as Pool['query'];

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
    logger.error('Exiting because database is unreachable.');
    process.exit();
  }
};
