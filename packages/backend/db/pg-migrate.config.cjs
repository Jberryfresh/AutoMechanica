const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: process.env.ENV_FILE_PATH ?? path.join(process.cwd(), '.env') });

if (!process.env.DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.warn('DATABASE_URL is not set. node-pg-migrate will fail without a connection string.');
}

module.exports = {
  migrationsTable: 'schema_migrations',
  dir: path.join(__dirname, 'migrations'),
  databaseUrl: process.env.DATABASE_URL,
  direction: 'up',
  verbose: true,
};
