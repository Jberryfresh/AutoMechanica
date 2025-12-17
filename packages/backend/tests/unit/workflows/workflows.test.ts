import { describe, expect, it } from 'vitest';

import { handleTaskResult, startWorkflow } from '../../../src/orchestrator/Orchestrator.js';
import { ingestSupplierCatalogConfig } from '../../../src/workflows/wf_ingest_supplier_catalog.js';
import { publishNewPartConfig } from '../../../src/workflows/wf_publish_new_part.js';

import type { AgentEvent, AgentEventInput } from '../../../src/models/AgentEvent.js';
import type { CreateWorkflowInput, Workflow } from '../../../src/models/Workflow.js';
import type { EnqueueTaskInput, QueuedTask } from '../../../src/queue/TaskQueue.js';
import type { WorkflowConfig } from '../../../src/workflows/registry.js';

const createFakeDeps = (registry: Record<string, WorkflowConfig>): {
  workflows: Workflow[];
  tasks: QueuedTask[];
  deps: {
    registry: Record<string, WorkflowConfig>;
    createWorkflow: (
      input: CreateWorkflowInput,
      pool?: unknown
    ) => Promise<Workflow>;
    updateWorkflowState: (
      id: string,
      newState: Workflow['state'],
      contextPatch?: Record<string, unknown>,
      pool?: unknown
    ) => Promise<Workflow | null>;
    getWorkflowById: (id: string, pool?: unknown) => Promise<Workflow | null>;
    enqueueTask: (input: EnqueueTaskInput, pool?: unknown) => Promise<QueuedTask>;
    logAgentEvent: (event: AgentEventInput, pool?: unknown) => Promise<AgentEvent>;
  };
} => {
  const workflows: Workflow[] = [];
  const tasks: QueuedTask[] = [];

  return {
    workflows,
    tasks,
    deps: {
      registry,
      createWorkflow: async ({
        type,
        state,
        context,
      }: CreateWorkflowInput): Promise<Workflow> => {
        await Promise.resolve();
        const wf: Workflow = {
          id: `wf-${workflows.length + 1}`,
          type,
          state: state ?? 'pending',
          context: context ?? {},
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        workflows.push(wf);
        return wf;
      },
      updateWorkflowState: async (
        id: string,
        newState: Workflow['state'],
        contextPatch?: Record<string, unknown>
      ): Promise<Workflow | null> => {
        await Promise.resolve();
        const wf = workflows.find((w) => w.id === id);
        if (!wf) return null;
        wf.state = newState;
        wf.context = { ...(wf.context ?? {}), ...(contextPatch ?? {}) };
        wf.updatedAt = new Date();
        return wf;
      },
      getWorkflowById: async (id: string): Promise<Workflow | null> => {
        await Promise.resolve();
        return workflows.find((w) => w.id === id) ?? null;
      },
      enqueueTask: async (input: EnqueueTaskInput): Promise<QueuedTask> => {
        await Promise.resolve();
        const task: QueuedTask = {
          id: `task-${tasks.length + 1}`,
          workflowId: input.workflowId ?? null,
          agentName: input.agentName,
          taskType: input.taskType,
          payload: input.payload ?? {},
          priority: input.priority ?? 10,
          status: 'pending',
          attempts: 0,
          maxAttempts: input.maxAttempts ?? 5,
          availableAt: input.availableAt ?? new Date(),
          leaseOwner: null,
          leaseExpiresAt: null,
          errorInfo: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        tasks.push(task);
        return task;
      },
      logAgentEvent: async (event: AgentEventInput): Promise<AgentEvent> => {
        await Promise.resolve();
        return {
          id: `event-${tasks.length + workflows.length + 1}`,
          workflowId: event.workflowId ?? null,
          agentName: event.agentName,
          taskType: event.taskType,
          inputData: event.inputData ?? {},
          outputData: event.outputData ?? {},
          reasoning: event.reasoning ?? null,
          createdAt: new Date(),
        };
      },
    },
  };
};

describe('Workflows', () => {
  it('ingest workflow chains normalization -> match -> downstream tasks and completes', async () => {
    const { deps, tasks } = createFakeDeps({
      [ingestSupplierCatalogConfig.type]: ingestSupplierCatalogConfig,
    });

    const { workflow } = await startWorkflow(
      ingestSupplierCatalogConfig.type,
      { feedId: 'feed1' },
      undefined,
      deps
    );

    // simulate ingest supplier feed completion with two items
    const ingestTask = tasks[0];
    const ingestResult = await handleTaskResult(
      { ...ingestTask, payload: { items: [{ supplierPartId: 'sp1' }, { supplierPartId: 'sp2' }] } },
      { success: true, output: {} },
      undefined,
      deps
    );

    expect(ingestResult.nextTasks).toHaveLength(2);

    const normalizeTask = ingestResult.nextTasks[0];
    const matchResult = await handleTaskResult(
      normalizeTask,
      { success: true, output: {} },
      undefined,
      deps
    );

    expect(matchResult.nextTasks[0]?.taskType).toBe('product_data_match');

    const productTask = matchResult.nextTasks[0];
    const downstream = await handleTaskResult(
      productTask,
      { success: true, output: { canonicalPartId: 'part1', vehicleIds: ['veh1'] } },
      undefined,
      deps
    );

    expect(downstream.nextTasks.map((t) => t.taskType)).toEqual([
      'generate_fitment',
      'calculate_pricing',
      'generate_seo_content',
    ]);

    // complete downstream tasks to finish workflow
    let currentWorkflow = workflow;
    for (const task of downstream.nextTasks) {
      const res = await handleTaskResult(task, { success: true }, undefined, deps);
      currentWorkflow = res.workflow ?? currentWorkflow;
    }

    expect(currentWorkflow.state).toBe('completed');
  });

  it('publish new part workflow marks completion after all tasks', async () => {
    const { deps, tasks } = createFakeDeps({
      [publishNewPartConfig.type]: publishNewPartConfig,
    });

    const { workflow } = await startWorkflow(
      publishNewPartConfig.type,
      { partId: 'p1' },
      undefined,
      deps
    );

    expect(tasks).toHaveLength(3);

    let currentWorkflow = workflow;
    for (const task of tasks) {
      const res = await handleTaskResult(task, { success: true }, undefined, deps);
      currentWorkflow = res.workflow ?? currentWorkflow;
    }

    expect(currentWorkflow.state).toBe('completed');
  });
});
