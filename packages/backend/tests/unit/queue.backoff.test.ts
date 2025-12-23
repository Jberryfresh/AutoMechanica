import { vi, describe, it, expect, beforeEach } from 'vitest';

import { markTaskFailed, requeueWithBackoff } from '../../src/queue/TaskQueue';

const BASE_BACKOFF_MS = 5_000;

describe('TaskQueue backoff calculations', () => {
  let queries: Array<{ sql: string; params: any[] }>;
  let mockPool: any;

  beforeEach(() => {
    queries = [];
    mockPool = {
      query: vi.fn(async (sql: string, params?: any[]) => {
        queries.push({ sql, params: params ?? [] });

        // SELECT attempts
        if (/SELECT attempts, max_attempts FROM tasks WHERE id = \$1/i.test(sql)) {
          return { rows: [{ attempts: 2, max_attempts: 5 }] };
        }

        // UPDATE returning a row - echo back a simulated TaskRow
        return {
          rows: [
            {
              id: params && params[0] ? params[0] : 'task-1',
              workflow_id: null,
              agent_name: 'agent',
              task_type: 'type',
              payload: {},
              priority: 10,
              status: params && params.includes('dead') ? 'dead' : 'pending',
              attempts: params && typeof params[2] === 'number' ? params[2] : 3,
              max_attempts: 5,
              available_at: params && params[5] ? params[5] : new Date().toISOString(),
              lease_owner: null,
              lease_expires_at: null,
              error_info: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        };
      }),
    };
  });

  it('markTaskFailed computes backoff and increments attempts', async () => {
    const before = Date.now();
    const res = await markTaskFailed('task-1', { message: 'err' }, mockPool);
    expect(res).not.toBeNull();
    expect(res!.attempts).toBe(3);

    // Inspect the UPDATE params from queries: should be the second call
    const updateCall = queries.find((q) => /UPDATE tasks/i.test(q.sql) && q.params && q.params.length >= 6);
    expect(updateCall).toBeDefined();
    const params = updateCall!.params;

    // available_at was passed as params[5]
    const availableAt = params[5];
    expect(availableAt).toBeInstanceOf(Date);

    const expectedMs = Math.pow(3, 2) * BASE_BACKOFF_MS;
    const delta = availableAt.getTime() - before;
    // allow 1000ms slack for test execution time
    expect(delta).toBeGreaterThanOrEqual(expectedMs - 1000);
  });

  it('requeueWithBackoff computes backoff and increments attempts', async () => {
    const before = Date.now();
    const res = await requeueWithBackoff('task-2', mockPool);
    expect(res).not.toBeNull();
    expect(res!.attempts).toBe(3);

    const updateCall = queries.find((q) => /UPDATE tasks/i.test(q.sql) && q.params && q.params.length >= 4);
    expect(updateCall).toBeDefined();
    const params = updateCall!.params;

    // available_at was passed as params[3]
    const availableAt = params[3];
    expect(availableAt).toBeInstanceOf(Date);

    const expectedMs = Math.pow(3, 2) * BASE_BACKOFF_MS;
    const delta = availableAt.getTime() - before;
    expect(delta).toBeGreaterThanOrEqual(expectedMs - 1000);
  });
});
