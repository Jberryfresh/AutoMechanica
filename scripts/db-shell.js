// Cross-platform psql shell helper that respects .env overrides.
const { spawn } = require('child_process');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const user = process.env.POSTGRES_USER || 'automechanica';
const database = process.env.POSTGRES_DB || 'automechanica';

const child = spawn('docker', ['compose', 'exec', 'postgres', 'psql', '-U', user, '-d', database], {
  stdio: 'inherit',
  env: process.env,
});

child.on('error', (error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to launch docker compose for psql shell:', error.message);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
