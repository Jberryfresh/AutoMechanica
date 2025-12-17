import { ingestSupplierCatalogConfig } from './wf_ingest_supplier_catalog.js';
import { publishNewPartConfig } from './wf_publish_new_part.js';

import type { Workflow } from '../models/Workflow.js';
import type { QueuedTask } from '../queue/TaskQueue.js';

export interface WorkflowTaskSpec {
  taskType: string;
  agentName: string;
  payload?: Record<string, unknown>;
  priority?: number;
  availableAt?: Date;
  maxAttempts?: number;
}

export interface WorkflowDecisionComplete {
  action: 'complete';
}

export interface WorkflowDecisionEnqueue {
  action: 'enqueue';
  tasks: WorkflowTaskSpec[];
  contextPatch?: Record<string, unknown>;
}

export type WorkflowDecision = WorkflowDecisionComplete | WorkflowDecisionEnqueue | 'complete';

export interface WorkflowConfig {
  type: string;
  initialTasks: WorkflowTaskSpec[];
  onTaskComplete?: (input: {
    task: QueuedTask;
    result: { success: boolean; output?: Record<string, unknown>; error?: string };
    workflow: Workflow;
  }) => WorkflowDecision;
}

export const WORKFLOW_REGISTRY: Record<string, WorkflowConfig> = {
  wf_dummy: {
    type: 'wf_dummy',
    initialTasks: [
      {
        taskType: 'dummy_echo',
        agentName: 'DummyAgent',
        payload: { message: 'hello' },
        priority: 5,
      },
    ],
    onTaskComplete: () => ({ action: 'complete' }),
  },
  [ingestSupplierCatalogConfig.type]: ingestSupplierCatalogConfig,
  [publishNewPartConfig.type]: publishNewPartConfig,
};

export const getWorkflowConfig = (type: string): WorkflowConfig | undefined =>
  WORKFLOW_REGISTRY[type];
