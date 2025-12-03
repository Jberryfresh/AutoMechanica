import { testDatabaseConnection } from '../lib/db-test.js';
import { env } from '../lib/env.js';

function redactConnectionString(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    if (url.password) {
      url.password = '***';
    }
    return url.toString();
  } catch {
    return connectionString.replace(/\/\/([^:]+):[^@]*@/u, '//$1:***@');
  }
}

async function main(): Promise<void> {
  try {
    const result = await testDatabaseConnection();

    // eslint-disable-next-line no-console
    console.info('Database connection successful', {
      database: result.database,
      serverVersion: result.serverVersion,
      timestamp: result.timestamp,
      vectorExtensionEnabled: result.vectorExtensionEnabled,
      vectorExtensionVersion: result.vectorExtensionVersion ?? 'not detected',
      connection: redactConnectionString(env.DATABASE_URL),
    });

    if (!result.vectorExtensionEnabled) {
      // eslint-disable-next-line no-console
      console.error('pgvector extension is not enabled. Enable it before running migrations.');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // eslint-disable-next-line no-console
    console.error('Database connection failed', message);
    process.exit(1);
  }
}

void main();
