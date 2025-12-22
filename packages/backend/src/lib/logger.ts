import pino from 'pino';

import { env } from './env.js';

const level = env.LOG_LEVEL ?? 'info';

export const logger = pino({
  level,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['password', '*.password', 'headers.authorization'],
    remove: true,
  },
  formatters: {
    level(label) {
      return { level: label };
    },
  },
});

export type Logger = typeof logger;

