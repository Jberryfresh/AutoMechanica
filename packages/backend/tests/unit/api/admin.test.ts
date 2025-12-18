import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import adminRouter from '../../../src/api/admin.js';
import { getPool } from '../../../src/db/client.js';
import * as WorkflowModel from '../../../src/models/Workflow.js';

import type { MockedFunction, MockInstance } from 'vitest';

type MockPool = {
  query: MockedFunction<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>;
};

vi.mock('../../../src/db/client.js', () => {
  const pool: MockPool = {
    query: vi.fn<[string, unknown[]?], Promise<{ rows: unknown[] }>>(() =>
      Promise.resolve({ rows: [] })
    ),
  };
  return { getPool: vi.fn(() => pool) };
});

const app = express();
app.use(express.json());
app.use('/api', adminRouter);

describe('Admin API', () => {
  const pool = getPool() as unknown as MockPool;
  let getWorkflowByIdMock: MockInstance<
    Parameters<typeof WorkflowModel.getWorkflowById>,
    ReturnType<typeof WorkflowModel.getWorkflowById>
  >;
  let updateWorkflowStateMock: MockInstance<
    Parameters<typeof WorkflowModel.updateWorkflowState>,
    ReturnType<typeof WorkflowModel.updateWorkflowState>
  >;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    pool.query.mockResolvedValue({ rows: [] });
    getWorkflowByIdMock = vi.spyOn(WorkflowModel, 'getWorkflowById');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    getWorkflowByIdMock.mockResolvedValue(null);
    updateWorkflowStateMock = vi.spyOn(WorkflowModel, 'updateWorkflowState');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    updateWorkflowStateMock.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists workflows', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    pool.query.mockResolvedValue({ rows: [{ id: 'wf1', state: 'running' }] });
    const res = await request(app)
      .get('/api/admin/workflows')
      .set('x-admin-key', process.env.ADMIN_API_KEY ?? '');
    expect(res.status).toBe(200);
    const body = res.body as { workflows: Array<{ id: string; state: string }> };
    expect(body.workflows).toHaveLength(1);
  });

  it('requeues dead task', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 'task1',
          workflow_id: null,
          agent_name: 'Test',
          task_type: 'dummy',
          status: 'pending',
          attempts: 0,
          max_attempts: 5,
          error_info: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
    });

    const res = await request(app)
      .post('/api/admin/tasks/task1/requeue')
      .set('x-admin-key', process.env.ADMIN_API_KEY ?? '');

    expect(res.status).toBe(200);
    const body = res.body as { task: { id: string } };
    expect(body.task.id).toBe('task1');
  });

  it('retries workflow', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    getWorkflowByIdMock.mockResolvedValue({
      id: 'wf1',
      type: 'wf_dummy',
      state: 'failed',
      context: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    updateWorkflowStateMock.mockResolvedValue({
      id: 'wf1',
      type: 'wf_dummy',
      state: 'pending',
      context: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/admin/workflows/wf1/retry')
      .set('x-admin-key', process.env.ADMIN_API_KEY ?? '');

    expect(res.status).toBe(200);
    const body = res.body as { workflow: { state: string } };
    expect(body.workflow.state).toBe('pending');
  });
});
