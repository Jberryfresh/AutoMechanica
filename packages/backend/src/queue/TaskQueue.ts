import { getPool } from '../db/client.js';

import type { Pool } from 'pg';

export const TASK_STATUSES = [
  'pending',
  'leased',
  'running',
  'completed',
  'failed',
  'dead',
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface QueuedTask {
  id: string;
  workflowId: string | null;
  agentName: string;
  taskType: string;
  payload: Record<string, unknown>;
  priority: number;
  status: TaskStatus;
  attempts: number;
  maxAttempts: number;
  availableAt: Date;
  leaseOwner: string | null;
  leaseExpiresAt: Date | null;
  errorInfo: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnqueueTaskInput {
  workflowId?: string | null;
  agentName: string;
  taskType: string;
  payload?: Record<string, unknown>;
  priority?: number;
  maxAttempts?: number;
  availableAt?: Date;
}

export interface LeaseOptions {
  leaseMs?: number;
  now?: Date;
}

export interface ExtendLeaseOptions {
  extendMs?: number;
  now?: Date;
}

const BASE_BACKOFF_MS = 5_000;

export class TaskValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskValidationError';
  }
}

interface TaskRow {
  id: string;
  workflow_id: string | null;
  agent_name: string;
  task_type: string;
  payload: Record<string, unknown>;
  priority: number;
  status: TaskStatus;
  attempts: number;
  max_attempts: number;
  available_at: string | Date;
  lease_owner: string | null;
  lease_expires_at: string | Date | null;
  error_info: Record<string, unknown> | null;
  created_at: string | Date;
  updated_at: string | Date;
}

const mapRow = (row: TaskRow): QueuedTask => ({
  id: row.id,
  workflowId: row.workflow_id ?? null,
  agentName: row.agent_name,
  taskType: row.task_type,
  payload: row.payload ?? {},
  priority: row.priority,
  status: row.status,
  attempts: row.attempts,
  maxAttempts: row.max_attempts,
  availableAt: new Date(row.available_at),
  leaseOwner: row.lease_owner ?? null,
  leaseExpiresAt: row.lease_expires_at ? new Date(row.lease_expires_at) : null,
  errorInfo: row.error_info ?? null,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const validateEnqueueInput = (input: EnqueueTaskInput): void => {
  if (!input.agentName?.trim()) throw new TaskValidationError('agentName is required');
  if (!input.taskType?.trim()) throw new TaskValidationError('taskType is required');
  if (input.priority !== undefined && input.priority < 0) {
    throw new TaskValidationError('priority must be >= 0');
  }
  if (input.maxAttempts !== undefined && input.maxAttempts <= 0) {
    throw new TaskValidationError('maxAttempts must be > 0');
  }
};

export const enqueueTask = async (
  input: EnqueueTaskInput,
  pool: Pool = getPool()
): Promise<QueuedTask> => {
  validateEnqueueInput(input);

  const result = await pool.query<TaskRow>(
    `
      INSERT INTO tasks (
        workflow_id,
        agent_name,
        task_type,
        payload,
        priority,
        status,
        attempts,
        max_attempts,
        available_at
      )
      VALUES ($1, $2, $3, $4, $5, 'pending', 0, $6, $7)
      RETURNING *
    `,
    [
      input.workflowId ?? null,
      input.agentName.trim(),
      input.taskType.trim(),
      input.payload ?? {},
      input.priority ?? 10,
      input.maxAttempts ?? 5,
      input.availableAt ?? new Date(),
    ]
  );

  return mapRow(result.rows[0]);
};

export const leaseNextTask = async (
  workerId: string,
  options: LeaseOptions = {},
  pool: Pool = getPool()
): Promise<QueuedTask | null> => {
  if (!workerId?.trim()) throw new TaskValidationError('workerId is required');
  const leaseMs = options.leaseMs && options.leaseMs > 0 ? options.leaseMs : 30_000;
  const now = options.now ?? new Date();
  const leaseExpires = new Date(now.getTime() + leaseMs);

  const result = await pool.query<TaskRow>(
    `
      UPDATE tasks
      SET status = 'leased',
          lease_owner = $1,
          lease_expires_at = $2,
          updated_at = now()
      WHERE id = (
        SELECT id
        FROM tasks
        WHERE status IN ('pending', 'failed')
          AND available_at <= $3
        ORDER BY priority ASC, available_at ASC, created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      RETURNING *
    `,
    [workerId.trim(), leaseExpires, now]
  );

  return result.rows[0] ? mapRow(result.rows[0]) : null;
};

export const extendTaskLease = async (
  id: string,
  workerId: string,
  options: ExtendLeaseOptions = {},
  pool: Pool = getPool()
): Promise<QueuedTask | null> => {
  if (!workerId?.trim()) throw new TaskValidationError('workerId is required');
  const extendMs = options.extendMs && options.extendMs > 0 ? options.extendMs : 30_000;
  const now = options.now ?? new Date();
  const leaseExpires = new Date(now.getTime() + extendMs);

  const result = await pool.query<TaskRow>(
    `
      UPDATE tasks
      SET lease_expires_at = $3,
          updated_at = now()
      WHERE id = $1
        AND lease_owner = $2
        AND status IN ('leased', 'running')
      RETURNING *
    `,
    [id, workerId.trim(), leaseExpires]
  );

  return result.rows[0] ? mapRow(result.rows[0]) : null;
};

export const markTaskRunning = async (
  id: string,
  pool: Pool = getPool()
): Promise<QueuedTask | null> => {
  const result = await pool.query<TaskRow>(
    `
      UPDATE tasks
      SET status = 'running', updated_at = now()
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
};

export const markTaskCompleted = async (
  id: string,
  pool: Pool = getPool()
): Promise<QueuedTask | null> => {
  const result = await pool.query<TaskRow>(
    `
      UPDATE tasks
      SET status = 'completed',
          lease_owner = NULL,
          lease_expires_at = NULL,
          updated_at = now()
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
};

export const markTaskFailed = async (
  id: string,
  errorInfo: Record<string, unknown> | null = null,
  pool: Pool = getPool()
): Promise<QueuedTask | null> => {
  const result = await pool.query<TaskRow>(
    `
      UPDATE tasks
      SET attempts = attempts + 1,
          error_info = $2,
          status = CASE WHEN attempts + 1 >= max_attempts THEN 'dead' ELSE 'pending' END,
          available_at = CASE
            WHEN attempts + 1 >= max_attempts THEN now()
            ELSE now() + ((attempts + 1) ^ 2 * interval '1 millisecond' * $3)
          END,
          lease_owner = NULL,
          lease_expires_at = NULL,
          updated_at = now()
      WHERE id = $1
      RETURNING *
    `,
    [id, errorInfo, BASE_BACKOFF_MS]
  );

  return result.rows[0] ? mapRow(result.rows[0]) : null;
};

export const requeueWithBackoff = async (
  id: string,
  pool: Pool = getPool()
): Promise<QueuedTask | null> => {
  const result = await pool.query<TaskRow>(
    `
      UPDATE tasks
      SET status = CASE WHEN attempts + 1 >= max_attempts THEN 'dead' ELSE 'pending' END,
          attempts = attempts + 1,
          available_at = CASE
            WHEN attempts + 1 >= max_attempts THEN now()
            ELSE now() + ((attempts + 1) ^ 2 * interval '1 millisecond' * $2)
          END,
          lease_owner = NULL,
          lease_expires_at = NULL,
          updated_at = now()
      WHERE id = $1
      RETURNING *
    `,
    [id, BASE_BACKOFF_MS]
  );

  return result.rows[0] ? mapRow(result.rows[0]) : null;
};
