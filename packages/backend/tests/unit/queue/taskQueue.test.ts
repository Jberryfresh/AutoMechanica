/* eslint-disable import/order */
import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  enqueueTask,
  leaseNextTask,
  markTaskCompleted,
  markTaskFailed,
  markTaskRunning,
  requeueWithBackoff,
  type QueuedTask,
} from '../../../src/queue/TaskQueue.js';

import type { Pool } from 'pg';

interface FakeQueryResult<T = unknown> {
  rows: T[];
}

interface FakePool {
  query: (text: string, params?: unknown[]) => Promise<FakeQueryResult>;
}

interface TaskRow {
  id: string;
  workflow_id: string | null;
  agent_name: string;
  task_type: string;
  payload: Record<string, unknown>;
  priority: number;
  status: string;
  attempts: number;
  max_attempts: number;
  available_at: string;
  lease_owner: string | null;
  lease_expires_at: string | null;
  error_info: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

const toRow = (task: QueuedTask): TaskRow => ({
  id: task.id,
  workflow_id: task.workflowId,
  agent_name: task.agentName,
  task_type: task.taskType,
  payload: task.payload,
  priority: task.priority,
  status: task.status,
  attempts: task.attempts,
  max_attempts: task.maxAttempts,
  available_at: task.availableAt.toISOString(),
  lease_owner: task.leaseOwner,
  lease_expires_at: task.leaseExpiresAt ? task.leaseExpiresAt.toISOString() : null,
  error_info: task.errorInfo,
  created_at: task.createdAt.toISOString(),
  updated_at: task.updatedAt.toISOString(),
});

const createFakePool = (initial: QueuedTask[] = []): FakePool => {
  const store = [...initial];

  return {
    async query(text: string, params: unknown[] = []): Promise<FakeQueryResult> {
      await Promise.resolve();

      if (text.includes('INSERT INTO tasks')) {
        const [workflowId, agentName, taskType, payload, priority, maxAttempts, availableAt] =
          params as [string | null, string, string, Record<string, unknown>, number, number, Date];
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
        return { rows: [toRow(task)] };
      }

      if (text.includes('UPDATE tasks') && text.includes('FOR UPDATE SKIP LOCKED')) {
        const [workerId, leaseExpiresAt, now] = params as [string, Date, Date];
        const candidate = store
          .filter((t) => (t.status === 'pending' || t.status === 'failed') && t.availableAt <= now)
          .sort(
            (a, b) => a.priority - b.priority || a.availableAt.getTime() - b.availableAt.getTime()
          );
        const task = candidate[0];
        if (!task) return { rows: [] };
        task.status = 'leased';
        task.leaseOwner = workerId;
        task.leaseExpiresAt = leaseExpiresAt;
        task.updatedAt = new Date();
        return { rows: [toRow(task)] };
      }

      if (text.includes('UPDATE tasks') && text.includes("SET status = 'running'")) {
        const id = params[0] as string;
        const t = store.find((x) => x.id === id);
        if (!t) return { rows: [] };
        t.status = 'running';
        t.updatedAt = new Date();
        return { rows: [toRow(t)] };
      }

      if (text.includes("SET status = 'completed'")) {
        const id = params[0] as string;
        const t = store.find((x) => x.id === id);
        if (!t) return { rows: [] };
        t.status = 'completed';
        t.leaseOwner = null;
        t.leaseExpiresAt = null;
        t.updatedAt = new Date();
        return { rows: [toRow(t)] };
      }

      if (text.includes('status = CASE WHEN attempts + 1 >= max_attempts')) {
        const [id, backoffMsMaybe] = params as [string, number?];
        const backoffMs = typeof backoffMsMaybe === 'number' ? backoffMsMaybe : 5_000;
        const t = store.find((x) => x.id === id);
        if (!t) return { rows: [] };
        t.attempts += 1;
        const dead = t.attempts >= t.maxAttempts;
        t.status = dead ? 'dead' : 'pending';
        const delayMs = dead ? 0 : t.attempts ** 2 * backoffMs;
        t.availableAt = new Date(Date.now() + delayMs);
        t.leaseOwner = null;
        t.leaseExpiresAt = null;
        t.updatedAt = new Date();
        return { rows: [toRow(t)] };
      }

      if (text.includes('SET attempts = attempts + 1')) {
        const [id, errorInfoMaybe, backoffMsMaybe] = params as [
          string,
          Record<string, unknown> | null | number | undefined,
          number | undefined,
        ];
        const errorInfo =
          typeof errorInfoMaybe === 'number' || errorInfoMaybe === undefined
            ? null
            : errorInfoMaybe;
        const backoffMs = typeof backoffMsMaybe === 'number' ? backoffMsMaybe : 5_000;
        const t = store.find((x) => x.id === id);
        if (!t) return { rows: [] };
        t.attempts += 1;
        t.errorInfo = errorInfo;
        const dead = t.attempts >= t.maxAttempts;
        t.status = dead ? 'dead' : 'pending';
        const delayMs = dead ? 0 : t.attempts ** 2 * backoffMs;
        t.availableAt = new Date(Date.now() + delayMs);
        t.leaseOwner = null;
        t.leaseExpiresAt = null;
        t.updatedAt = new Date();
        return { rows: [toRow(t)] };
      }

      if (text.startsWith('UPDATE tasks')) {
        const id = params[0] as string;
        const t = store.find((x) => x.id === id);
        return t ? { rows: [toRow(t)] } : { rows: [] };
      }

      return { rows: [] };
    },
  };
};

describe('TaskQueue', () => {
  it('enqueues and leases tasks by priority', async () => {
    const pool = createFakePool() as unknown as Pool;
    await enqueueTask({ agentName: 'A', taskType: 't1', priority: 5 }, pool);
    await enqueueTask({ agentName: 'A', taskType: 't2', priority: 1 }, pool);

    const first = await leaseNextTask('worker-1', { now: new Date() }, pool);
    const second = await leaseNextTask('worker-2', { now: new Date() }, pool);

    expect(first?.taskType).toBe('t2');
    expect(second?.taskType).toBe('t1');
  });

  it('marks running/completed and prevents double leasing', async () => {
    const pool = createFakePool() as unknown as Pool;
    const task = await enqueueTask({ agentName: 'A', taskType: 't1' }, pool);

    const lease1 = await leaseNextTask('worker-1', { now: new Date() }, pool);
    const lease2 = await leaseNextTask('worker-2', { now: new Date() }, pool);
    expect(lease1?.id).toBe(task.id);
    expect(lease2).toBeNull();

    const running = await markTaskRunning(task.id, pool);
    expect(running?.status).toBe('running');

    const done = await markTaskCompleted(task.id, pool);
    expect(done?.status).toBe('completed');
  });

  it('applies backoff and moves to dead after max attempts', async () => {
    const now = new Date();
    const pool = createFakePool() as unknown as Pool;
    const task = await enqueueTask({ agentName: 'A', taskType: 't1', maxAttempts: 2 }, pool);

    const leased = await leaseNextTask('worker-1', { now }, pool);
    expect(leased?.id).toBe(task.id);

    const failedOnce = await markTaskFailed(task.id, { msg: 'boom' }, pool);
    expect(failedOnce?.status).toBe('pending');
    expect((failedOnce?.availableAt.getTime() ?? 0) > now.getTime()).toBe(true);

    const leasedAgain = await leaseNextTask(
      'worker-2',
      { now: new Date(Date.now() + 60_000) },
      pool
    );
    expect(leasedAgain?.id).toBe(task.id);

    const failedTwice = await markTaskFailed(task.id, { msg: 'boom2' }, pool);
    expect(failedTwice?.status).toBe('dead');
  });

  it('requeues with backoff helper', async () => {
    const pool = createFakePool() as unknown as Pool;
    const task = await enqueueTask({ agentName: 'A', taskType: 't1', maxAttempts: 1 }, pool);
    const requeued = await requeueWithBackoff(task.id, pool);
    expect(requeued?.status).toBe('dead');
  });
});
