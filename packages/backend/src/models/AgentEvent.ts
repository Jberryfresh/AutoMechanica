import { getPool } from '../db/client.js';

import type { Pool } from 'pg';
export interface AgentEvent {
  id: string;
  workflowId: string | null;
  agentName: string;
  taskType: string;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown>;
  reasoning: string | null;
  createdAt: Date;
}

export interface AgentEventInput {
  workflowId?: string | null;
  agentName: string;
  taskType: string;
  inputData?: Record<string, unknown>;
  outputData?: Record<string, unknown>;
  reasoning?: string | null;
}

export class AgentEventValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentEventValidationError';
  }
}

const validateAgentEventInput = (input: AgentEventInput): void => {
  if (!input.agentName?.trim()) throw new AgentEventValidationError('agentName is required');
  if (!input.taskType?.trim()) throw new AgentEventValidationError('taskType is required');
  if (input.inputData !== undefined && (typeof input.inputData !== 'object' || Array.isArray(input.inputData))) {
    throw new AgentEventValidationError('inputData must be an object when provided');
  }
  if (input.outputData !== undefined && (typeof input.outputData !== 'object' || Array.isArray(input.outputData))) {
    throw new AgentEventValidationError('outputData must be an object when provided');
  }
};

interface AgentEventRow {
  id: string;
  workflow_id: string | null;
  agent_name: string;
  task_type: string;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  reasoning: string | null;
  created_at: string | Date;
}

const mapAgentEventRow = (row: AgentEventRow): AgentEvent => ({
  id: row.id,
  workflowId: row.workflow_id ?? null,
  agentName: row.agent_name,
  taskType: row.task_type,
  inputData: row.input_data ?? {},
  outputData: row.output_data ?? {},
  reasoning: row.reasoning ?? null,
  createdAt: new Date(row.created_at),
});

export const logAgentEvent = async (
  input: AgentEventInput,
  pool: Pool = getPool()
): Promise<AgentEvent> => {
  validateAgentEventInput(input);

  const result = await pool.query<AgentEventRow>(
    `
      INSERT INTO agent_events (workflow_id, agent_name, task_type, input_data, output_data, reasoning)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, workflow_id, agent_name, task_type, input_data, output_data, reasoning, created_at
    `,
    [
      input.workflowId ?? null,
      input.agentName.trim(),
      input.taskType.trim(),
      input.inputData ?? {},
      input.outputData ?? {},
      input.reasoning ?? null,
    ]
  );

  return mapAgentEventRow(result.rows[0]);
};

export const listAgentEventsForWorkflow = async (
  workflowId: string,
  pool: Pool = getPool()
): Promise<AgentEvent[]> => {
  const result = await pool.query<AgentEventRow>(
    `
      SELECT id, workflow_id, agent_name, task_type, input_data, output_data, reasoning, created_at
      FROM agent_events
      WHERE workflow_id = $1
      ORDER BY created_at ASC
    `,
    [workflowId]
  );

  return result.rows.map(mapAgentEventRow);
};
