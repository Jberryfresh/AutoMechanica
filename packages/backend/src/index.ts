import compression from 'compression';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import adminRouter from './api/admin.js';
import garageRouter from './api/garage.js';
import healthRouter from './api/health.js';
import supportRouter from './api/support.js';
import vehiclesRouter from './api/vehicles.js';
import { closePool, initializeDatabase } from './db/client.js';
import { env } from './lib/env.js';
import { logger } from './lib/logger.js';

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

const httpLogger = (pinoHttp as unknown as (opts: unknown) => express.RequestHandler)({
  logger,
  genReqId: (req: { headers: NodeJS.Dict<string | string[]> }) => {
    const headers = req.headers;
    const candidate = headers['x-request-id'];
    return (Array.isArray(candidate) ? candidate[0] : candidate) ?? crypto.randomUUID();
  },
  autoLogging: env.ENABLE_REQUEST_LOGGING && env.NODE_ENV !== 'test',
  redact: ['req.headers.authorization'],
});

app.use(httpLogger);

app.get('/api', (_req, res) => {
  res.json({
    status: 'ok',
    routes: ['/api/health'],
    environment: env.NODE_ENV,
  });
});
app.use('/api', healthRouter);
app.use('/api', vehiclesRouter);
app.use('/api', garageRouter);
app.use('/api', supportRouter);
app.use('/api', adminRouter);

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
  });
});

app.use((error: HttpError, req: Request, res: Response, _next: NextFunction) => {
  const status = error.status ?? 500;
  const payload = {
    error: error.message || 'Internal Server Error',
    details: env.NODE_ENV === 'development' ? error.details : undefined,
  };
  // Log server-side for observability without leaking sensitive info to clients
  const requestLogger = (req as { log?: { error: (payload: unknown, msg?: string) => void } }).log;
  if (requestLogger) {
    requestLogger.error({ err: error }, 'Unhandled error');
  } else {
    logger.error({ err: error }, 'Unhandled error');
  }
  res.status(status).json(payload);
});

export async function startServer(): Promise<void> {
  await initializeDatabase();
  const port = env.PORT;
  const server = app.listen(port, () => {
    logger.info(`Backend server listening on port ${port}`);
    logger.info('Health endpoint available at /api/health');
  });

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    await closePool();
    await new Promise<void>((resolve) => {
      server.close(() => {
        logger.info('Server closed gracefully');
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
