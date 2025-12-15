import { routeLLM } from '../llm/router.js';
import { logAgentEvent, type AgentEventInput } from '../models/AgentEvent.js';
import { createPart } from '../models/Part.js';
import { attachCanonicalPart, getSupplierPartById, updateNormalizedData } from '../models/SupplierPart.js';

import type { Pool } from 'pg';

interface TaskPayload {
  supplierPartId: string;
}

interface NormalizedData {
  [key: string]: unknown;
  name: string | null;
  category: string | null;
  brand: string | null;
  position: string | null;
  material: string | null;
  attributes: Record<string, unknown>;
  reasoning?: string;
}

export interface SupplierNormalizationDeps {
  getSupplierPartById: typeof getSupplierPartById;
  updateNormalizedData: typeof updateNormalizedData;
  attachCanonicalPart: typeof attachCanonicalPart;
  createPart: typeof createPart;
  routeLLM: typeof routeLLM;
  logAgentEvent: typeof logAgentEvent;
}

const defaultDeps: SupplierNormalizationDeps = {
  getSupplierPartById,
  updateNormalizedData,
  attachCanonicalPart,
  createPart,
  routeLLM,
  logAgentEvent,
};

const normalizeString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const titleCase = (value: string): string =>
  value
    .toLowerCase()
    .split(' ')
    .map((w) => (w ? w[0]?.toUpperCase() + w.slice(1) : ''))
    .join(' ')
    .trim();

export class SupplierNormalizationAgent {
  constructor(private readonly deps: SupplierNormalizationDeps = defaultDeps) {}

  async runTask(task: { payload: TaskPayload }, pool?: Pool): Promise<void> {
    const { supplierPartId } = task.payload ?? {};
    if (!supplierPartId) throw new Error('supplierPartId is required');

    const supplierPart = await this.deps.getSupplierPartById(supplierPartId, pool);
    if (!supplierPart) throw new Error(`SupplierPart ${supplierPartId} not found`);

    const raw = supplierPart.rawData ?? {};
    const normalized = this.buildNormalized(raw);

    // Optional LLM enrichment; swallow errors for resilience.
    try {
      const llmResult = await this.deps.routeLLM({
        taskType: 'normalization',
        payload: { raw },
      });
      if (llmResult?.output) {
        normalized.reasoning = llmResult.reasoning ?? llmResult.output;
      }
    } catch {
      // ignore LLM failures at MVP stage
    }

    await this.deps.updateNormalizedData(supplierPartId, normalized, pool);

    // If category/name present but no canonical part, optionally create one (MVP helper).
    if (!supplierPart.canonicalPartId && normalized.name && normalized.category) {
      const part = await this.deps.createPart(
        {
          name: normalized.name,
          category: normalized.category,
          brand: normalized.brand ?? undefined,
          attributes: normalized.attributes ?? {},
        },
        pool
      );
      await this.deps.attachCanonicalPart(supplierPartId, part.id, pool);
    }

    await this.deps.logAgentEvent(this.buildEvent(supplierPartId, raw, normalized), pool);
  }

  private buildNormalized(raw: Record<string, unknown>): NormalizedData {
    const name =
      normalizeString(raw.name) ??
      normalizeString(raw.title) ??
      normalizeString(raw.description) ??
      null;
    const category = normalizeString(raw.category) ?? normalizeString(raw.segment) ?? null;
    const brand = normalizeString(raw.brand ?? raw.mfg ?? raw.manufacturer);
    const position = normalizeString(raw.position ?? raw.side ?? raw.location);
    const material = normalizeString(raw.material);

    const attributes: Record<string, unknown> = {};
    if (raw.attributes && typeof raw.attributes === 'object' && !Array.isArray(raw.attributes)) {
      Object.assign(attributes, raw.attributes as Record<string, unknown>);
    }
    if (position) attributes.position = position;
    if (material) attributes.material = material;

    return {
      name: name ? titleCase(name) : null,
      category: category?.toLowerCase() ?? null,
      brand: brand ? titleCase(brand) : null,
      position,
      material,
      attributes,
    };
  }

  private buildEvent(
    supplierPartId: string,
    raw: Record<string, unknown>,
    normalized: Record<string, unknown>
  ): AgentEventInput {
    return {
      workflowId: null,
      agentName: 'SupplierNormalizationAgent',
      taskType: 'normalize_supplier_part',
      inputData: { supplierPartId, raw },
      outputData: { normalized },
      reasoning: normalized.reasoning ? String(normalized.reasoning) : 'Normalized supplier part',
    };
  }
}
