import { Client } from 'pg';

import { env } from './env.js';

export interface DatabaseTestResult {
  database: string;
  serverVersion: string;
  timestamp: string;
  vectorExtensionEnabled: boolean;
  vectorExtensionVersion?: string;
}

/**
 * Attempts to connect to the configured PostgreSQL instance and verifies the pgvector extension.
 */
export async function testDatabaseConnection(): Promise<DatabaseTestResult> {
  const client = new Client({ connectionString: env.DATABASE_URL });

  try {
    await client.connect();

    const connectionMetadata = await client.query<{
      database: string;
      version: string;
      now: Date;
    }>('SELECT current_database() AS database, version() AS version, NOW() AS now');

    const vectorExtension = await client.query<{
      extversion: string | null;
    }>("SELECT extversion FROM pg_extension WHERE extname = 'vector'");

    const metadata = connectionMetadata.rows[0];
    const vectorVersion = vectorExtension.rows[0]?.extversion ?? undefined;

    return {
      database: metadata?.database ?? 'unknown',
      serverVersion: metadata?.version ?? 'unknown',
      timestamp: metadata?.now?.toISOString?.() ?? new Date().toISOString(),
      vectorExtensionEnabled: Boolean(vectorVersion),
      vectorExtensionVersion: vectorVersion,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Database connectivity check failed: ${message}`, {
      cause: error instanceof Error ? error : undefined,
    });
  } finally {
    await client.end().catch((closeError) => {
      // eslint-disable-next-line no-console
      console.error('Failed to close database connection', closeError);
    });
  }
}
