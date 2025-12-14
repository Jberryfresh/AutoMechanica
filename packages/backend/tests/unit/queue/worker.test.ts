import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  enqueueTask,
  leaseNextTask,
  markTaskCompleted,
  markTaskRunning,
} from '../../../src/queue/TaskQueue.js';
import { Worker } from '../../../src/queue/Worker.js';

import type { QueuedTask } from '../../../src/queue/TaskQueue.js';
import type { Pool } from 'pg';

interface FakeQueryResult<T = unknown> {
  rows: T[];
}

interface FakePool {
  query: (text: string, params?: unknown[]) => Promise<FakeQueryResult>;
}

interface FakePoolWithStore {
  pool: FakePool;
  store: QueuedTask[];
  stats: { extendCalls: number; lastLeaseExpiresAt: Date | null };
}

const createFakePool = (tasks: QueuedTask[] = []): FakePoolWithStore => {
  const store = [...tasks];
  const stats: { extendCalls: number; lastLeaseExpiresAt: Date | null } = {
    extendCalls: 0,
    lastLeaseExpiresAt: null,
  };

  const pool: FakePool = {
    async query(text: string, params: unknown[] = []): Promise<FakeQueryResult> {
      await Promise.resolve();

      if (text.includes('INSERT INTO tasks')) {
        const [workflowId, agentName, taskType, payload, priority, maxAttempts, availableAt] = params as [
          string | null,
          string,
          string,
          Record<string, unknown>,
          number,
          number,
          Date
        ];
        const task: QueuedTask = {
          id: randomUUID(),
          workflowId,
          agentName,
          taskType,
          payload,
          priority,
          status: 'pending',
          attempts: 0,
          maxAttempts,
          availableAt,
          leaseOwner: null,
          leaseExpiresAt: null,
          errorInfo: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.push(task);
        return { rows: [{ ...task, workflow_id: workflowId, task_type: taskType, agent_name: agentName }] };
      }

      if (text.includes('UPDATE tasks') && text.includes('FOR UPDATE SKIP LOCKED')) {
        const [workerId, leaseExpiresAt, now] = params as [string, Date, Date];
        const candidate = store
          .filter((t) => (t.status === 'pending' || t.status === 'failed') && t.availableAt <= now)
          .sort((a, b) => a.priority - b.priority);
        const task = candidate[0];
        if (!task) return { rows: [] };
        task.status = 'leased';
        task.leaseOwner = workerId;
        task.leaseExpiresAt = leaseExpiresAt;
        task.updatedAt = new Date();
        return { rows: [{ ...task, workflow_id: task.workflowId, task_type: task.taskType, agent_name: task.agentName }] };
      }

      if (text.includes('SET status = \'running\'')) {
        const id = params[0] as string;
        const t = store.find((x) => x.id === id);
        if (!t) return { rows: [] };
        t.status = 'running';
        return { rows: [{ ...t, workflow_id: t.workflowId, task_type: t.taskType, agent_name: t.agentName }] };
      }

      if (text.includes('lease_expires_at = $3') && text.includes('lease_owner = $2')) {
        const [id, workerId, leaseExpiresAt] = params as [string, string, Date];
        const t = store.find(
          (x) =>
            x.id === id &&
            x.leaseOwner === workerId &&
            (x.status === 'leased' || x.status === 'running')
        );
        if (!t) return { rows: [] };
        stats.extendCalls += 1;
        stats.lastLeaseExpiresAt = leaseExpiresAt;
        t.leaseExpiresAt = leaseExpiresAt;
        t.updatedAt = new Date();
        return { rows: [{ ...t, workflow_id: t.workflowId, task_type: t.taskType, agent_name: t.agentName }] };
      }

      if (text.includes('SET status = \'completed\'')) {
        const id = params[0] as string;
        const t = store.find((x) => x.id === id);
        if (!t) return { rows: [] };
        t.status = 'completed';
        t.leaseOwner = null;
        t.leaseExpiresAt = null;
        return { rows: [{ ...t, workflow_id: t.workflowId, task_type: t.taskType, agent_name: t.agentName }] };
      }

      if (text.includes('SET attempts = attempts + 1')) {
        const id = params[0] as string;
        const t = store.find((x) => x.id === id);
        if (!t) return { rows: [] };
        t.attempts += 1;
        t.status = 'failed';
        t.leaseOwner = null;
        return { rows: [{ ...t, workflow_id: t.workflowId, task_type: t.taskType, agent_name: t.agentName }] };
      }

      if (text.includes('SET status = CASE WHEN attempts + 1 >= max_attempts')) {
        const id = params[0] as string;
        const t = store.find((x) => x.id === id);
        if (!t) return { rows: [] };
        t.status = 'dead';
        t.leaseOwner = null;
        return { rows: [{ ...t, workflow_id: t.workflowId, task_type: t.taskType, agent_name: t.agentName }] };
      }

      return { rows: [] };
    },
  };

  return { pool, store, stats };
};

describe('Worker', () => {
  it('processes tasks end-to-end', async () => {
    const { pool, store } = createFakePool();
    await enqueueTask({ agentName: 'TestAgent', taskType: 'echo', payload: { msg: 'hi' } }, pool as unknown as Pool);

    const handled: string[] = [];
    const worker = new Worker(
      {
        echo: async (task): Promise<void> => {
          await Promise.resolve();
          handled.push(task.id);
        },
      },
      {
        workerId: 'worker-1',
        pollIntervalMs: 10,
        leaseMs: 1_000,
        stopSignal: (): boolean => handled.length > 0,
      },
      pool as unknown as Pool
    );

    await worker.start();

    expect(handled).toHaveLength(1);
    expect(store[0]?.status).toBe('completed');
  });

  it('marks tasks completed and prevents double lease', async () => {
    const { pool } = createFakePool();
    const task = await enqueueTask({ agentName: 'TestAgent', taskType: 'noop' }, pool as unknown as Pool);
    const lease1 = await leaseNextTask('w1', { now: new Date() }, pool as unknown as Pool);
    expect(lease1?.id).toBe(task.id);
    const lease2 = await leaseNextTask('w2', { now: new Date() }, pool as unknown as Pool);
    expect(lease2).toBeNull();

    await markTaskRunning(task.id, pool as unknown as Pool);
    const completed = await markTaskCompleted(task.id, pool as unknown as Pool);
    expect(completed?.status).toBe('completed');
  });

  it('extends leases for long-running tasks', async () => {
    const { pool, store, stats } = createFakePool();
    await enqueueTask({ agentName: 'TestAgent', taskType: 'slow' }, pool as unknown as Pool);

    const worker = new Worker(
      {
        slow: async (): Promise<void> => {
          await new Promise((resolve) => setTimeout(resolve, 30));
        },
      },
      {
        workerId: 'worker-lease',
        pollIntervalMs: 1,
        leaseMs: 10,
        extendIntervalMs: 5,
        extendLeaseMs: 20,
        stopSignal: (): boolean => store[0]?.status === 'completed',
      },
      pool as unknown as Pool
    );

    await worker.start();

    expect(stats.extendCalls).toBeGreaterThan(0);
    expect(stats.lastLeaseExpiresAt).not.toBeNull();
    expect(store[0]?.status).toBe('completed');
  });
});
