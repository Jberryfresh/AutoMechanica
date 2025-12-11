import { getPool } from '../db/client.js';

import type { Pool } from 'pg';
export const WORKFLOW_STATES = ['pending', 'running', 'completed', 'failed'] as const;
export type WorkflowState = (typeof WORKFLOW_STATES)[number];

export interface Workflow {
  id: string;
  type: string;
  state: WorkflowState;
  context: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkflowInput {
  type: string;
  state?: WorkflowState;
  context?: Record<string, unknown>;
}

export class WorkflowValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkflowValidationError';
  }
}

const ensureValidState = (state: string): WorkflowState => {
  const normalized = state.trim().toLowerCase();
  if ((WORKFLOW_STATES as readonly string[]).includes(normalized)) return normalized as WorkflowState;
  throw new WorkflowValidationError(`state must be one of: ${WORKFLOW_STATES.join(', ')}`);
};

const validateCreateInput = (input: CreateWorkflowInput): void => {
  if (!input.type?.trim()) throw new WorkflowValidationError('type is required');
  if (input.state) ensureValidState(input.state);
  if (input.context !== undefined && (typeof input.context !== 'object' || Array.isArray(input.context))) {
    throw new WorkflowValidationError('context must be an object when provided');
  }
};

interface WorkflowRow {
  id: string;
  type: string;
  state: WorkflowState;
  context: Record<string, unknown>;
  created_at: string | Date;
  updated_at: string | Date;
}

const mapWorkflowRow = (row: WorkflowRow): Workflow => ({
  id: row.id,
  type: row.type,
  state: row.state,
  context: row.context ?? {},
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

export const createWorkflow = async (
  input: CreateWorkflowInput,
  pool: Pool = getPool()
): Promise<Workflow> => {
  validateCreateInput(input);
  const state = ensureValidState(input.state ?? 'pending');
  const context = input.context ?? {};

  const result = await pool.query<WorkflowRow>(
    `
      INSERT INTO workflows (type, state, context)
      VALUES ($1, $2, $3)
      RETURNING id, type, state, context, created_at, updated_at
    `,
    [input.type.trim(), state, context]
  );

  return mapWorkflowRow(result.rows[0]);
};

export const getWorkflowById = async (id: string, pool: Pool = getPool()): Promise<Workflow | null> => {
  const result = await pool.query<WorkflowRow>(
    `
      SELECT id, type, state, context, created_at, updated_at
      FROM workflows
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] ? mapWorkflowRow(result.rows[0]) : null;
};

export const updateWorkflowState = async (
  id: string,
  newState: WorkflowState,
  contextPatch?: Record<string, unknown>,
  pool: Pool = getPool()
): Promise<Workflow | null> => {
  const state = ensureValidState(newState);
  const patch = contextPatch ?? {};

  if (contextPatch !== undefined && (typeof contextPatch !== 'object' || Array.isArray(contextPatch))) {
    throw new WorkflowValidationError('contextPatch must be an object when provided');
  }

  const result = await pool.query<WorkflowRow>(
    `
      UPDATE workflows
      SET state = $1,
          context = COALESCE(context, '{}'::jsonb) || $2::jsonb,
          updated_at = now()
      WHERE id = $3
      RETURNING id, type, state, context, created_at, updated_at
    `,
    [state, patch, id]
  );

  return result.rows[0] ? mapWorkflowRow(result.rows[0]) : null;
};
