import type { WorkflowConfig, WorkflowTaskSpec } from './registry.js';

export const INGEST_WORKFLOW_TYPE = 'wf_ingest_supplier_catalog';

interface FeedItem {
  supplierPartId?: string;
  vehicleIds?: string[];
}

const normalizeTask = (supplierPartId: string): WorkflowTaskSpec => ({
  taskType: 'normalize_supplier_part',
  agentName: 'SupplierNormalizationAgent',
  payload: { supplierPartId },
  priority: 5,
});

const matchTask = (supplierPartId: string): WorkflowTaskSpec => ({
  taskType: 'product_data_match',
  agentName: 'ProductDataAgent',
  payload: { supplierPartId },
  priority: 6,
});

const fitmentTask = (canonicalPartId: string, vehicleIds: string[]): WorkflowTaskSpec => ({
  taskType: 'generate_fitment',
  agentName: 'FitmentAgent',
  payload: { canonicalPartId, vehicles: vehicleIds.map((id) => ({ id })) },
  priority: 7,
});

const pricingTask = (canonicalPartId: string): WorkflowTaskSpec => ({
  taskType: 'calculate_pricing',
  agentName: 'PricingAgent',
  payload: { canonicalPartId },
  priority: 8,
});

const seoTask = (canonicalPartId: string): WorkflowTaskSpec => ({
  taskType: 'generate_seo_content',
  agentName: 'SEOAgent',
  payload: { canonicalPartId },
  priority: 9,
});

export const ingestSupplierCatalogConfig: WorkflowConfig = {
  type: INGEST_WORKFLOW_TYPE,
  initialTasks: [
    {
      taskType: 'ingest_supplier_feed',
      agentName: 'IngestAgent',
      payload: {},
      priority: 1,
    },
  ],
  onTaskComplete: ({ task, result, workflow }) => {
    if (!result.success) {
      return { action: 'complete' };
    }

    if (task.taskType === 'ingest_supplier_feed') {
      const feedItems = Array.isArray(task.payload.items)
        ? (task.payload.items as FeedItem[])
        : [];
      const normalizeTasks = feedItems
        .map((item) => item.supplierPartId)
        .filter((id): id is string => Boolean(id))
        .map((id) => normalizeTask(id));
      return {
        action: 'enqueue',
        tasks: normalizeTasks,
        contextPatch: { feedCount: feedItems.length },
      };
    }

    if (task.taskType === 'normalize_supplier_part') {
      const supplierPartId = task.payload?.supplierPartId as string | undefined;
      if (!supplierPartId) return { action: 'complete' };
      return { action: 'enqueue', tasks: [matchTask(supplierPartId)] };
    }

    if (task.taskType === 'product_data_match') {
      const canonicalPartId = result.output?.canonicalPartId as string | undefined;
      const vehicles = (result.output?.vehicleIds as string[] | undefined) ?? [];
      if (!canonicalPartId) return { action: 'complete' };
      const tasks: WorkflowTaskSpec[] = [pricingTask(canonicalPartId), seoTask(canonicalPartId)];
      if (vehicles.length) tasks.unshift(fitmentTask(canonicalPartId, vehicles));
      return { action: 'enqueue', tasks };
    }

    if (
      ['generate_fitment', 'calculate_pricing', 'generate_seo_content'].includes(task.taskType)
    ) {
      const completedCount = (workflow.context?.completedSteps as number | undefined) ?? 0;
      const nextCount = completedCount + 1;
      if (nextCount >= 3) {
        return { action: 'complete' };
      }
      return { action: 'enqueue', tasks: [], contextPatch: { completedSteps: nextCount } };
    }

    return { action: 'complete' };
  },
};
