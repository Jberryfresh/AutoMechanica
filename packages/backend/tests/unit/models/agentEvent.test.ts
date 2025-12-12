/* eslint-disable import/order */
import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { AgentEventValidationError, logAgentEvent, listAgentEventsForWorkflow } from '../../../src/models/AgentEvent.js';
import type { AgentEvent } from '../../../src/models/AgentEvent.js';

import type { Pool } from 'pg';

interface FakeQueryResult<T = unknown> {
  rows: T[];
}

interface FakePool {
  query: (text: string, params?: unknown[]) => Promise<FakeQueryResult>;
}

interface AgentEventRow {
  id: string;
  workflow_id: string | null;
  agent_name: string;
  task_type: string;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  reasoning: string | null;
  created_at: string;
}

const eventToRow = (evt: AgentEvent): AgentEventRow => ({
  id: evt.id,
  workflow_id: evt.workflowId,
  agent_name: evt.agentName,
  task_type: evt.taskType,
  input_data: evt.inputData,
  output_data: evt.outputData,
  reasoning: evt.reasoning,
  created_at: evt.createdAt.toISOString(),
});

const createFakePool = (events: AgentEvent[] = []): FakePool => {
  const store = [...events];

  return {
    async query(text: string, params: unknown[] = []): Promise<FakeQueryResult> {
      await Promise.resolve();

      if (text.includes('INSERT INTO agent_events')) {
        const [workflowId, agentName, taskType, inputData, outputData, reasoning] = params as [
          string | null,
          string,
          string,
          Record<string, unknown>,
          Record<string, unknown>,
          string | null
        ];
        const evt: AgentEvent = {
          id: randomUUID(),
          workflowId,
          agentName,
          taskType,
          inputData,
          outputData,
          reasoning,
          createdAt: new Date(),
        };
        store.push(evt);
        return { rows: [eventToRow(evt)] };
      }

      if (text.includes('FROM agent_events') && text.includes('WHERE workflow_id = $1')) {
        const workflowId = params[0] as string;
        const filtered = store.filter((e) => e.workflowId === workflowId).sort((a, b) => {
          return a.createdAt.getTime() - b.createdAt.getTime();
        });
        return { rows: filtered.map(eventToRow) };
      }

      return { rows: [] };
    },
  };
};

describe('AgentEvent model', () => {
  it('logs an agent event with optional workflow', async () => {
    const pool = createFakePool() as unknown as Pool;
    const evt = await logAgentEvent(
      {
        workflowId: 'wf-1',
        agentName: 'TestAgent',
        taskType: 'ingest',
        inputData: { foo: 'bar' },
        outputData: { result: 1 },
        reasoning: 'did a thing',
      },
      pool
    );

    expect(evt.workflowId).toBe('wf-1');
    expect(evt.reasoning).toBe('did a thing');
  });

  it('lists events by workflow', async () => {
    const e1: AgentEvent = {
      id: 'evt-1',
      workflowId: 'wf-1',
      agentName: 'A1',
      taskType: 't1',
      inputData: {},
      outputData: {},
      reasoning: null,
      createdAt: new Date('2024-01-01T00:00:00Z'),
    };
    const e2: AgentEvent = { ...e1, id: 'evt-2', createdAt: new Date('2024-01-02T00:00:00Z') };
    const pool = createFakePool([e1, e2]) as unknown as Pool;

    const events = await listAgentEventsForWorkflow('wf-1', pool);
    expect(events.map((e) => e.id)).toEqual(['evt-1', 'evt-2']);
  });

  it('validates required fields', async () => {
    const pool = createFakePool() as unknown as Pool;

    await expect(
      logAgentEvent(
        { agentName: '', taskType: 't', inputData: {}, outputData: {} },
        pool
      )
    ).rejects.toBeInstanceOf(AgentEventValidationError);
  });
});
