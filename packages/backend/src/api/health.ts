import { Router } from 'express';

import { checkDatabaseConnection, getPool } from '../db/client.js';
import { env } from '../lib/env.js';

const router = Router();

router.get('/health', (_req, res): void => {
  void (async (): Promise<void> => {
    const start = performance.now();
    let dbOk = false;
    try {
      await checkDatabaseConnection();
      dbOk = true;
    } catch {
      dbOk = false;
    }
    const durationMs = Number((performance.now() - start).toFixed(2));

    res.status(dbOk ? 200 : 503).json({
      status: dbOk ? 'ok' : 'degraded',
      service: 'backend',
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      version: '0.1.0',
      dependencies: {
        database: dbOk,
      },
      latencyMs: durationMs,
      dbPool: {
        total: getPool().totalCount,
        idle: getPool().idleCount,
        waiting: getPool().waitingCount,
      },
    });
  })();
});

export default router;
