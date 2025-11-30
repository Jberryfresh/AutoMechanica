import { Router } from 'express';

import { env } from '../lib/env.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'backend',
    environment: env.NODE_ENV,
    uptime: process.uptime(),
    version: '0.1.0',
  });
});

export default router;
