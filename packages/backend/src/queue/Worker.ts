import { getPool } from '../db/client.js';

import {
  extendTaskLease,
  leaseNextTask,
  markTaskCompleted,
  markTaskFailed,
  markTaskRunning,
} from './TaskQueue.js';

import type { QueuedTask } from './TaskQueue.js';
import type { Pool } from 'pg';

export interface WorkerOptions {
  workerId?: string;
  leaseMs?: number;
  pollIntervalMs?: number;
  extendLeaseMs?: number;
  extendIntervalMs?: number;
  stopSignal?: () => boolean;
}

export type TaskHandler = (task: QueuedTask) => Promise<void>;

export interface WorkerHandlers {
  [taskType: string]: TaskHandler;
}

/** Simple queue-driven worker with optional lease extension and graceful stop hook. */
export class Worker {
  private readonly workerId: string;
  private readonly pool: Pool;
  private readonly handlers: WorkerHandlers;
  private readonly leaseMs: number;
  private readonly pollIntervalMs: number;
  private readonly extendLeaseMs: number;
  private readonly extendIntervalMs: number;
  private readonly stopSignal?: () => boolean;

  constructor(handlers: WorkerHandlers, options: WorkerOptions = {}, pool: Pool = getPool()) {
    if (!Object.keys(handlers).length) throw new Error('Worker requires at least one handler');
    this.handlers = handlers;
    this.workerId = options.workerId ?? `worker-${Math.random().toString(36).slice(2, 8)}`;
    this.pool = pool;
    this.leaseMs = options.leaseMs ?? 30_000;
    this.pollIntervalMs = options.pollIntervalMs ?? 500;
    this.extendLeaseMs = options.extendLeaseMs ?? this.leaseMs;
    this.extendIntervalMs = options.extendIntervalMs ?? Math.floor(this.leaseMs / 2);
    this.stopSignal = options.stopSignal;
  }

  async start(): Promise<void> {
    while (!this.stopSignal?.()) {
      try {
        const task = await leaseNextTask(this.workerId, { leaseMs: this.leaseMs }, this.pool);
        if (!task) {
          await this.sleep(this.pollIntervalMs);
          continue;
        }

        await this.processTask(task);
      } catch {
        await this.sleep(this.pollIntervalMs);
      }
    }
  }

  private async processTask(task: QueuedTask): Promise<void> {
    const handler = this.handlers[task.taskType];
    if (!handler) {
      await markTaskFailed(task.id, { message: 'No handler for task type' }, this.pool);
      return;
    }

    const runningTask = await markTaskRunning(task.id, this.pool);
    if (!runningTask) return;

    const stopExtender = this.startLeaseExtender(task.id);

    try {
      await handler({ ...task, status: runningTask.status, updatedAt: runningTask.updatedAt });
      await markTaskCompleted(task.id, this.pool);
    } catch (error) {
      await markTaskFailed(task.id, { message: (error as Error).message }, this.pool);
    } finally {
      stopExtender();
    }
  }

  private startLeaseExtender(taskId: string): () => void {
    let active = true;

    const interval = setInterval(() => {
      if (!active) return;
      void extendTaskLease(taskId, this.workerId, { extendMs: this.extendLeaseMs }, this.pool).catch(
        () => undefined
      );
    }, this.extendIntervalMs);

    return (): void => {
      active = false;
      clearInterval(interval);
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
