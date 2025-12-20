import { Router, type NextFunction, type Request, type Response } from 'express';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';

import { getPool } from '../db/client.js';
import { env } from '../lib/env.js';
import { getWorkflowById, updateWorkflowState } from '../models/Workflow.js';

import type { Pool } from 'pg';

const router = Router();

const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const adminHeader = Array.isArray(req.headers['x-admin-key'])
      ? req.headers['x-admin-key'][0]
      : req.headers['x-admin-key'];
    const clientIp = req.ip ?? 'unknown';
    return `${ipKeyGenerator(clientIp)}:${adminHeader ?? 'none'}`;
  },
});

// Apply the rate limiter to all admin routes
router.use(adminRateLimiter);

type AdminHandler = (req: Request, res: Response, next: NextFunction, pool: Pool) => Promise<void>;

const withAdminGuard =
  (handler: AdminHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
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

router.get(
  '/admin/metrics',
  withAdminGuard(async (req, res, _next, pool) => {
    const hoursRaw = Number(req.query.hours);
    const hours = Number.isFinite(hoursRaw) && hoursRaw > 0 ? Math.min(hoursRaw, 720) : 24;

    const [taskCountsResult, workflowCountsResult, agentEventsResult, agentEventsRecentResult] =
      await Promise.all([
        pool.query<{ status: string; count: string }>(
          `SELECT status, COUNT(*)::text as count FROM tasks GROUP BY status`
        ),
        pool.query<{ state: string; count: string }>(
          `SELECT state, COUNT(*)::text as count FROM workflows GROUP BY state`
        ),
        pool.query<{ total: string }>(`SELECT COUNT(*)::text as total FROM agent_events`),
        pool.query<{ total: string }>(
          `SELECT COUNT(*)::text as total FROM agent_events WHERE created_at >= now() - ($1 || ' hours')::interval`,
          [hours]
        ),
      ]);

    const taskCounts = taskCountsResult.rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = Number(row.count);
      return acc;
    }, {});

    const workflowCounts = workflowCountsResult.rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.state] = Number(row.count);
      return acc;
    }, {});

    res.json({
      tasks: {
        total: Object.values(taskCounts).reduce((a, b) => a + b, 0),
        byStatus: taskCounts,
      },
      workflows: {
        total: Object.values(workflowCounts).reduce((a, b) => a + b, 0),
        byState: workflowCounts,
      },
      agentEvents: {
        total: Number(agentEventsResult.rows[0]?.total ?? 0),
        lastHours: hours,
        recentCount: Number(agentEventsRecentResult.rows[0]?.total ?? 0),
      },
    });
  })
);

export default router;
