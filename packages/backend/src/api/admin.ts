import { Router, type NextFunction, type Request, type Response } from 'express';

import { getPool } from '../db/client.js';
import { env } from '../lib/env.js';
import { getWorkflowById, updateWorkflowState } from '../models/Workflow.js';

import type { Pool } from 'pg';

const router = Router();

type AdminHandler = (req: Request, res: Response, next: NextFunction, pool: Pool) => Promise<void>;

const withAdminGuard =
  (handler: AdminHandler) => (req: Request, res: Response, next: NextFunction): void => {
    if (env.ADMIN_API_KEY && req.headers['x-admin-key'] !== env.ADMIN_API_KEY) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const pool = getPool();
    void handler(req, res, next, pool).catch(next);
  };

router.get(
  '/admin/workflows',
  withAdminGuard(async (req, res, _next, pool) => {
    const { state, type, limit = '50', offset = '0' } = req.query;
    const lim = Math.min(Number(limit) || 50, 200);
    const off = Number(offset) || 0;

    const filters: string[] = [];
    const params: Array<string | number> = [];
    if (state) {
      params.push(String(state));
      filters.push(`state = $${params.length}`);
    }
    if (type) {
      params.push(String(type));
      filters.push(`type = $${params.length}`);
    }
    params.push(lim, off);

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const result = await pool.query(
      `
        SELECT id, type, state, context, created_at, updated_at
        FROM workflows
        ${where}
        ORDER BY updated_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `,
      params
    );

    res.json({ workflows: result.rows });
  })
);

router.get(
  '/admin/workflows/:id',
  withAdminGuard(async (req, res, _next, pool) => {
    const workflow = await getWorkflowById(req.params.id, pool);
    if (!workflow) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }
    res.json({ workflow });
  })
);

router.post(
  '/admin/workflows/:id/retry',
  withAdminGuard(async (req, res, _next, pool) => {
    const workflow = await getWorkflowById(req.params.id, pool);
    if (!workflow) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }
    const restarted = await updateWorkflowState(workflow.id, 'pending', { lastError: null }, pool);
    res.json({ workflow: restarted });
  })
);

router.get(
  '/admin/tasks',
  withAdminGuard(async (req, res, _next, pool) => {
    const { status, limit = '50', offset = '0' } = req.query;
    const lim = Math.min(Number(limit) || 50, 200);
    const off = Number(offset) || 0;

    const filters: string[] = [];
    const params: Array<string | number> = [];
    if (status) {
      params.push(String(status));
      filters.push(`status = $${params.length}`);
    }
    params.push(lim, off);
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const result = await pool.query(
      `
        SELECT id, workflow_id, agent_name, task_type, status, attempts, max_attempts, error_info, created_at, updated_at
        FROM tasks
        ${where}
        ORDER BY updated_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `,
      params
    );

    res.json({ tasks: result.rows });
  })
);

router.post(
  '/admin/tasks/:id/requeue',
  withAdminGuard(async (req, res, _next, pool) => {
    const result = await pool.query(
      `
        UPDATE tasks
        SET status = 'pending',
            attempts = 0,
            lease_owner = null,
            lease_expires_at = null,
            available_at = now(),
            updated_at = now()
        WHERE id = $1 AND status = 'dead'
        RETURNING id, workflow_id, agent_name, task_type, status, attempts, max_attempts, error_info, created_at, updated_at
      `,
      [req.params.id]
    );

    const row = result.rows[0] as
      | {
          id: string;
          workflow_id: string | null;
          agent_name: string;
          task_type: string;
          status: string;
          attempts: number;
          max_attempts: number;
          error_info: Record<string, unknown> | null;
          created_at: Date;
          updated_at: Date;
        }
      | undefined;

    if (!row) {
      res.status(404).json({ error: 'Task not found or not dead' });
      return;
    }

    res.json({ task: row });
  })
);

export default router;
