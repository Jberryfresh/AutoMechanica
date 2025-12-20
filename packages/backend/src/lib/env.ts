import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const booleanString = z
  .union([z.string(), z.boolean()])
  .optional()
  .transform((value) => {
    if (typeof value === 'boolean') return value;
    return value !== undefined && value.toLowerCase() !== 'false' && value !== '0';
  });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3001),
  DATABASE_URL: z
    .string({ required_error: 'DATABASE_URL is required' })
    .url('DATABASE_URL must be a valid URL'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
  BACKEND_URL: z.string().url('BACKEND_URL must be a valid URL'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  ENABLE_REQUEST_LOGGING: booleanString.default(true),
  EMBEDDING_MODEL: z.string().default('text-embedding-3-large'),
  DEFAULT_LLM_PROVIDER: z.string().default('openai'),
  DEFAULT_LLM_MODEL: z.string().default('gpt-4-turbo-preview'),
  TASK_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(5000),
  MAX_CONCURRENT_TASKS: z.coerce.number().int().positive().default(5),
  TASK_TIMEOUT_MS: z.coerce.number().int().positive().default(300000),
  VECTOR_DIMENSIONS: z.coerce.number().int().positive().default(3072),
  VECTOR_SIMILARITY_THRESHOLD: z.coerce.number().min(0).max(1).default(0.7),
  MEMORY_BACKEND: z.enum(['pgvector', 'qdrant']).default('pgvector'),
  QDRANT_URL: z.string().url('QDRANT_URL must be a valid URL').optional(),
  QDRANT_API_KEY: z.string().optional(),
  SLOW_QUERY_THRESHOLD_MS: z.coerce.number().int().positive().default(300),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  ADMIN_API_KEY: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

function formatIssues(issues: z.ZodIssue[]): string {
  return issues.map((issue) => `- ${issue.path.join('.') || 'root'}: ${issue.message}`).join('\n');
}

function loadEnvironment(): EnvConfig {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errorMessage = formatIssues(parsed.error.issues);
    console.error('Invalid environment configuration. Please update your .env file.');
    console.error(errorMessage);
    throw new Error('Environment validation failed.');
  }

  return parsed.data;
}

export const env = loadEnvironment();
