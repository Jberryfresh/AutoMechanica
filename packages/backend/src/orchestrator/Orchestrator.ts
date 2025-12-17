import { logAgentEvent } from '../models/AgentEvent.js';
import {
  createWorkflow,
  getWorkflowById,
  updateWorkflowState,
  type Workflow,
  type WorkflowState,
} from '../models/Workflow.js';
import { enqueueTask, type QueuedTask } from '../queue/TaskQueue.js';
import { WORKFLOW_REGISTRY, type WorkflowConfig, type WorkflowTaskSpec } from '../workflows/registry.js';

import type { Pool } from 'pg';

export interface TaskResult {
  success: boolean;
  output?: Record<string, unknown>;
  error?: string;
}

interface OrchestratorDeps {
  registry: Record<string, WorkflowConfig>;
  enqueueTask: typeof enqueueTask;
  createWorkflow: typeof createWorkflow;
  updateWorkflowState: typeof updateWorkflowState;
  getWorkflowById: typeof getWorkflowById;
  logAgentEvent: typeof logAgentEvent;
}

const defaultDeps: OrchestratorDeps = {
  registry: WORKFLOW_REGISTRY,
  enqueueTask,
  createWorkflow,
  updateWorkflowState,
  getWorkflowById,
  logAgentEvent,
};

const resolveDeps = (deps?: Partial<OrchestratorDeps>): OrchestratorDeps => ({
  ...defaultDeps,
  ...deps,
  registry: deps?.registry ?? defaultDeps.registry,
});

export const startWorkflow = async (
  workflowType: string,
  initialContext: Record<string, unknown> = {},
  pool?: Pool,
  deps?: Partial<OrchestratorDeps>
): Promise<{ workflow: Workflow; tasks: QueuedTask[] }> => {
  const { registry, createWorkflow: create, enqueueTask: enqueue, logAgentEvent: log } =
    resolveDeps(deps);
  const config = registry[workflowType];
  if (!config) throw new Error(`Unknown workflow type: ${workflowType}`);

  const workflow = await create({ type: workflowType, state: 'running', context: initialContext }, pool);

  const tasks = await Promise.all(
    config.initialTasks.map((task) => scheduleTask(task, workflow.id, enqueue, pool))
  );

  await log(
    {
      workflowId: workflow.id,
      agentName: 'Orchestrator',
      taskType: `start:${workflowType}`,
      inputData: { initialContext },
      outputData: { workflowId: workflow.id, initialTasks: tasks.map((t) => t.taskType) },
      reasoning: `Started workflow ${workflowType}`,
    },
    pool
  );

  return { workflow, tasks };
};

export const handleTaskResult = async (
  task: QueuedTask,
  result: TaskResult,
  pool?: Pool,
  deps?: Partial<OrchestratorDeps>
): Promise<{ workflow: Workflow | null; nextTasks: QueuedTask[] }> => {
  const {
    registry,
    updateWorkflowState: updateState,
    getWorkflowById: getWorkflow,
    enqueueTask: enqueue,
    logAgentEvent: log,
  } = resolveDeps(deps);

  if (!task.workflowId) {
    return { workflow: null, nextTasks: [] };
  }

  const workflow = await getWorkflow(task.workflowId, pool);
  if (!workflow) return { workflow: null, nextTasks: [] };

  const config = registry[workflow.type];
  if (!config) return { workflow, nextTasks: [] };

  await log(
    {
      workflowId: workflow.id,
      agentName: 'Orchestrator',
      taskType: task.taskType,
      inputData: { taskId: task.id, payload: task.payload },
      outputData: { result },
      reasoning: `Handled result for ${task.taskType}`,
    },
    pool
  );

  if (!result.success) {
    const failedWorkflow = await updateState(
      workflow.id,
      'failed',
      { lastError: result.error ?? 'Task failed' },
      pool
    );
    return { workflow: failedWorkflow, nextTasks: [] };
  }

  const decision =
    config.onTaskComplete?.({ task, result, workflow }) ?? { action: 'complete' as const };

  if (decision === 'complete' || decision.action === 'complete') {
    const completed = await updateState(workflow.id, 'completed', result.output ?? {}, pool);
    return { workflow: completed, nextTasks: [] };
  }

  if (decision.action === 'enqueue') {
    const nextTasks = decision.tasks?.length
      ? await Promise.all(
          decision.tasks.map((t) => scheduleTask(t, workflow.id, enqueue, pool))
        )
      : [];

    if (decision.contextPatch) {
      await updateState(workflow.id, workflow.state, decision.contextPatch, pool);
    }

    return { workflow, nextTasks };
  }

  return { workflow, nextTasks: [] };
};

export const transitionWorkflowState = async (
  workflowId: string,
  nextState: WorkflowState,
  contextPatch?: Record<string, unknown>,
  pool?: Pool,
  deps?: Partial<OrchestratorDeps>
): Promise<Workflow | null> => {
  const { updateWorkflowState: updateState } = resolveDeps(deps);
  return updateState(workflowId, nextState, contextPatch, pool);
};

const scheduleTask = async (
  task: WorkflowTaskSpec,
  workflowId: string,
  enqueue: typeof enqueueTask,
  pool?: Pool
): Promise<QueuedTask> =>
  enqueue(
    {
      workflowId,
      agentName: task.agentName,
      taskType: task.taskType,
      payload: task.payload ?? {},
      priority: task.priority ?? 10,
      availableAt: task.availableAt ?? new Date(),
      maxAttempts: task.maxAttempts,
    },
    pool
  );
