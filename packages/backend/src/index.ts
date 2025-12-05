import compression from 'compression';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import healthRouter from './api/health.js';
import { closePool, initializeDatabase } from './db/client.js';
import { env } from './lib/env.js';

export interface HttpError extends Error {
  status?: number;
  details?: unknown;
}

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.ENABLE_REQUEST_LOGGING) {
  app.use(
    morgan('combined', {
      skip: (_req, _res) => env.NODE_ENV === 'test',
    })
  );
}

app.get('/api', (_req, res) => {
  res.json({
    status: 'ok',
    routes: ['/api/health'],
    environment: env.NODE_ENV,
  });
});
app.use('/api', healthRouter);

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: HttpError, _req: Request, res: Response, _next: NextFunction) => {
  const status = error.status ?? 500;
  const payload = {
    error: error.message || 'Internal Server Error',
    details: env.NODE_ENV === 'development' ? error.details : undefined,
  };
  // Log server-side for observability without leaking sensitive info to clients
  // eslint-disable-next-line no-console
  console.error('Unhandled error', error);
  res.status(status).json(payload);
});

export async function startServer(): Promise<void> {
  await initializeDatabase();
  const port = env.PORT;
  const server = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.info(`Backend server listening on port ${port}`);
    // eslint-disable-next-line no-console
    console.info(`Health endpoint available at /api/health`);
  });

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    // eslint-disable-next-line no-console
    console.info(`Received ${signal}, shutting down gracefully...`);
    await closePool();
    await new Promise<void>((resolve) => {
      server.close(() => {
        // eslint-disable-next-line no-console
        console.info('Server closed gracefully');
        resolve();
      });
    });
  };

  process.once('SIGTERM', (signal) => {
    void shutdown(signal);
  });
  process.once('SIGINT', (signal) => {
    void shutdown(signal);
  });
}

if (env.NODE_ENV !== 'test') {
  void startServer();
}
