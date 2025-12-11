/* eslint-disable import/order */
import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  WorkflowValidationError,
  createWorkflow,
  getWorkflowById,
  updateWorkflowState,
  type WorkflowState,
  type Workflow,
} from '../../../src/models/Workflow.js';

import type { Pool } from 'pg';

interface FakeQueryResult<T = unknown> {
  rows: T[];
}

interface FakePool {
  query: (text: string, params?: unknown[]) => Promise<FakeQueryResult>;
}

interface WorkflowRow {
  id: string;
  type: string;
  state: WorkflowState;
  context: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const workflowToRow = (wf: Workflow): WorkflowRow => ({
  id: wf.id,
  type: wf.type,
  state: wf.state,
  context: wf.context,
  created_at: wf.createdAt.toISOString(),
  updated_at: wf.updatedAt.toISOString(),
});

const createFakePool = (workflows: Workflow[] = []): FakePool => {
  const store = [...workflows];

  return {
    async query(text: string, params: unknown[] = []): Promise<FakeQueryResult> {
      await Promise.resolve();

      if (text.includes('INSERT INTO workflows')) {
        const [type, state, context] = params as [string, WorkflowState, Record<string, unknown>];
        const wf: Workflow = {
          id: randomUUID(),
          type,
          state,
          context,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.push(wf);
        return { rows: [workflowToRow(wf)] };
      }

      if (text.includes('FROM workflows') && text.includes('WHERE id = $1')) {
        const found = store.find((w) => w.id === params[0]);
        return { rows: found ? [workflowToRow(found)] : [] };
      }

      if (text.includes('UPDATE workflows')) {
        const [state, patch, id] = params as [WorkflowState, Record<string, unknown>, string];
        const index = store.findIndex((w) => w.id === id);
        if (index === -1) return { rows: [] };
        store[index] = {
          ...store[index],
          state,
          context: { ...(store[index].context ?? {}), ...(patch ?? {}) },
          updatedAt: new Date(),
        };
        return { rows: [workflowToRow(store[index])] };
      }

      return { rows: [] };
    },
  };
};

describe('Workflow model', () => {
  it('creates a workflow with default pending state', async () => {
    const pool = createFakePool() as unknown as Pool;
    const wf = await createWorkflow({ type: 'wf_test' }, pool);

    expect(wf.state).toBe('pending');
    expect(wf.type).toBe('wf_test');
  });

  it('updates workflow state and merges context', async () => {
    const existing: Workflow = {
      id: 'wf-1',
      type: 'wf_test',
      state: 'pending',
      context: { step: 1 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const pool = createFakePool([existing]) as unknown as Pool;

    const updated = await updateWorkflowState('wf-1', 'running', { step: 2, note: 'in-progress' }, pool);
    expect(updated?.state).toBe('running');
    expect(updated?.context).toEqual({ step: 2, note: 'in-progress' });
  });

  it('validates workflow state', async () => {
    const pool = createFakePool() as unknown as Pool;
    await expect(createWorkflow({ type: 'wf_test', state: 'bogus' as WorkflowState }, pool)).rejects.toBeInstanceOf(
      WorkflowValidationError
    );
  });

  it('fetches by id', async () => {
    const existing: Workflow = {
      id: 'wf-1',
      type: 'wf_test',
      state: 'pending',
      context: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const pool = createFakePool([existing]) as unknown as Pool;

    const found = await getWorkflowById('wf-1', pool);
    expect(found?.id).toBe('wf-1');
  });
});
