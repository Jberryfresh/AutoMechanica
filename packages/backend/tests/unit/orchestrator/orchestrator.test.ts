import { randomUUID } from 'node:crypto';

import { describe, expect, it, vi } from 'vitest';

import { handleTaskResult, startWorkflow, type TaskResult } from '../../../src/orchestrator/Orchestrator.js';

import type { AgentEvent, AgentEventInput } from '../../../src/models/AgentEvent.js';
import type { CreateWorkflowInput, Workflow, WorkflowState } from '../../../src/models/Workflow.js';
import type { EnqueueTaskInput, QueuedTask } from '../../../src/queue/TaskQueue.js';
import type { WorkflowConfig } from '../../../src/workflows/registry.js';

interface TestWorkflow extends Workflow {
  type: string;
}

type CreateWorkflowFn = (input: CreateWorkflowInput) => Promise<TestWorkflow>;
type UpdateWorkflowStateFn = (
  id: string,
  nextState: WorkflowState,
  contextPatch?: Record<string, unknown>
) => Promise<TestWorkflow | null>;
type GetWorkflowByIdFn = (id: string) => Promise<TestWorkflow | null>;
type EnqueueTaskFn = (input: EnqueueTaskInput) => Promise<QueuedTask>;
type LogAgentEventFn = (input: AgentEventInput) => Promise<AgentEvent>;

const createTestDeps = (): {
  workflows: TestWorkflow[];
  tasks: QueuedTask[];
  events: unknown[];
  deps: {
    registry: Record<string, WorkflowConfig>;
    createWorkflow: CreateWorkflowFn;
    updateWorkflowState: UpdateWorkflowStateFn;
    getWorkflowById: GetWorkflowByIdFn;
    enqueueTask: EnqueueTaskFn;
    logAgentEvent: LogAgentEventFn;
  };
} => {
  const workflows: TestWorkflow[] = [];
  const tasks: QueuedTask[] = [];
  const events: unknown[] = [];

  const registry: Record<string, WorkflowConfig> = {
    wf_dummy: {
      type: 'wf_dummy',
      initialTasks: [
        { taskType: 'dummy_echo', agentName: 'DummyAgent', payload: { message: 'hi' }, priority: 1 },
      ],
      onTaskComplete: () => ({ action: 'complete' }),
    },
  };

  const createWorkflow = ({
    type,
    state,
    context,
  }: CreateWorkflowInput): Promise<TestWorkflow> => {
    const workflow: TestWorkflow = {
      id: randomUUID(),
      type,
      state: state ?? 'pending',
      context: context ?? {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    workflows.push(workflow);
    return Promise.resolve(workflow);
  };

  const updateWorkflowState = (
    id: string,
    nextState: WorkflowState,
    contextPatch?: Record<string, unknown>
  ): Promise<TestWorkflow | null> => {
    const wf = workflows.find((w) => w.id === id);
    if (!wf) return Promise.resolve(null);
    wf.state = nextState;
    wf.context = { ...(wf.context ?? {}), ...(contextPatch ?? {}) };
    wf.updatedAt = new Date();
    return Promise.resolve(wf);
  };

  const getWorkflowById = (id: string): Promise<TestWorkflow | null> =>
    Promise.resolve(workflows.find((w) => w.id === id) ?? null);

  const enqueueTask = ({
    workflowId,
    agentName,
    taskType,
    payload,
    priority = 10,
    maxAttempts = 5,
    availableAt = new Date(),
  }: EnqueueTaskInput): Promise<QueuedTask> => {
    const task: QueuedTask = {
      id: randomUUID(),
      workflowId: workflowId ?? null,
      agentName,
      taskType,
      payload: payload ?? {},
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
    tasks.push(task);
    return Promise.resolve(task);
  };

  const logAgentEvent = vi.fn((event: Parameters<LogAgentEventFn>[0]) => {
    events.push(event);
    return Promise.resolve({
      id: randomUUID(),
      workflowId: event.workflowId ?? null,
      agentName: event.agentName,
      taskType: event.taskType,
      inputData: event.inputData ?? {},
      outputData: event.outputData ?? {},
      reasoning: event.reasoning ?? null,
      createdAt: new Date(),
    });
  });

  return {
    workflows,
    tasks,
    events,
    deps: {
      registry,
      createWorkflow,
      updateWorkflowState,
      getWorkflowById,
      enqueueTask,
      logAgentEvent,
    },
  };
};

describe('Orchestrator', () => {
  it('starts a workflow and enqueues initial tasks from registry', async () => {
    const { deps, workflows, tasks, events } = createTestDeps();
    const { workflow, tasks: created } = await startWorkflow('wf_dummy', { foo: 'bar' }, undefined, deps);

    expect(workflow.state).toBe('running');
    expect(workflows).toHaveLength(1);
    expect(created).toHaveLength(1);
    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.workflowId).toBe(workflow.id);
    expect(events.length).toBeGreaterThan(0);
  });

  it('completes workflow on successful task result and logs decision', async () => {
    const { deps, workflows, tasks, events } = createTestDeps();
    await startWorkflow('wf_dummy', {}, undefined, deps);
    const task = tasks.at(0);
    if (!task) throw new Error('Task was not enqueued');

    const result: TaskResult = { success: true, output: { msg: 'ok' } };
    const { workflow: updated, nextTasks } = await handleTaskResult(task, result, undefined, deps);

    expect(updated?.state).toBe('completed');
    expect(nextTasks).toHaveLength(0);
    expect(events.length).toBeGreaterThan(1);
    expect(workflows[0]?.context.msg).toBe('ok');
  });

  it('marks workflow failed on task failure', async () => {
    const { deps, workflows, tasks } = createTestDeps();
    await startWorkflow('wf_dummy', {}, undefined, deps);
    const task = tasks.at(0);
    if (!task) throw new Error('Task was not enqueued');

    const result: TaskResult = { success: false, error: 'boom' };
    const { workflow: updated, nextTasks } = await handleTaskResult(task, result, undefined, deps);

    expect(updated?.state).toBe('failed');
    expect(nextTasks).toHaveLength(0);
    expect(workflows[0]?.context.lastError).toBe('boom');
  });
});
