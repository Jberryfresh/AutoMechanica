import type { WorkflowConfig } from './registry.js';

export const PUBLISH_WORKFLOW_TYPE = 'wf_publish_new_part';

export const publishNewPartConfig: WorkflowConfig = {
  type: PUBLISH_WORKFLOW_TYPE,
  initialTasks: [
    { taskType: 'generate_fitment', agentName: 'FitmentAgent', payload: {}, priority: 5 },
    { taskType: 'calculate_pricing', agentName: 'PricingAgent', payload: {}, priority: 5 },
    { taskType: 'generate_seo_content', agentName: 'SEOAgent', payload: {}, priority: 5 },
  ],
  onTaskComplete: ({ task, result, workflow }) => {
    if (!result.success) return { action: 'complete' };

    const context = workflow.context ?? {};
    const progress = {
      fitmentDone: context.fitmentDone ?? false,
      pricingDone: context.pricingDone ?? false,
      seoDone: context.seoDone ?? false,
    };

    if (task.taskType === 'generate_fitment') progress.fitmentDone = true;
    if (task.taskType === 'calculate_pricing') progress.pricingDone = true;
    if (task.taskType === 'generate_seo_content') progress.seoDone = true;

    const allDone = progress.fitmentDone && progress.pricingDone && progress.seoDone;

    if (allDone) {
      return { action: 'complete', tasks: [] };
    }

    return { action: 'enqueue', tasks: [], contextPatch: progress };
  },
};
