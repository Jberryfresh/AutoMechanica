import { logAgentEvent, type AgentEventInput } from '../models/AgentEvent.js';
import { createPart, getPartById, updatePart, type Part } from '../models/Part.js';
import { attachCanonicalPart, getSupplierPartById, listSupplierPartsByCanonicalId } from '../models/SupplierPart.js';

import type { Pool } from 'pg';

interface TaskPayload {
  supplierPartId: string;
}

export interface ProductDataDeps {
  getSupplierPartById: typeof getSupplierPartById;
  listSupplierPartsByCanonicalId: typeof listSupplierPartsByCanonicalId;
  attachCanonicalPart: typeof attachCanonicalPart;
  createPart: typeof createPart;
  getPartById: typeof getPartById;
  updatePart: typeof updatePart;
  logAgentEvent: typeof logAgentEvent;
}

const defaultDeps: ProductDataDeps = {
  getSupplierPartById,
  listSupplierPartsByCanonicalId,
  attachCanonicalPart,
  createPart,
  getPartById,
  updatePart,
  logAgentEvent,
};

const stringOrNull = (val: unknown): string | null =>
  typeof val === 'string' && val.trim() ? val.trim() : null;

export class ProductDataAgent {
  constructor(private readonly deps: ProductDataDeps = defaultDeps) {}

  async runTask(task: { payload: TaskPayload }, pool?: Pool): Promise<void> {
    const supplierPartId = task.payload?.supplierPartId;
    if (!supplierPartId) throw new Error('supplierPartId is required');

    const supplierPart = await this.deps.getSupplierPartById(supplierPartId, pool);
    if (!supplierPart) throw new Error(`SupplierPart ${supplierPartId} not found`);
    if (!supplierPart.normalizedData) throw new Error('normalizedData is required before matching');

    const norm = supplierPart.normalizedData;
    const name = stringOrNull(norm.name) ?? 'Unknown';
    const category = stringOrNull(norm.category) ?? 'uncategorized';
    const brand = stringOrNull(norm.brand);

    const existing = await this.findExistingPart(name, category, brand, pool);

    const targetPart =
      existing ??
      (await this.deps.createPart(
        {
          name,
          category,
          brand: brand ?? undefined,
          attributes: (norm.attributes as Record<string, unknown> | undefined) ?? {},
        },
        pool
      ));

    await this.deps.attachCanonicalPart(supplierPartId, targetPart.id, pool);

    await this.deps.logAgentEvent(
      this.buildEvent(supplierPartId, targetPart.id, existing ? 'matched' : 'created'),
      pool
    );
  }

  private async findExistingPart(
    name: string,
    category: string,
    brand: string | null,
    pool?: Pool
  ): Promise<Part | null> {
    const result = await (pool ?? null)?.query<{
      id: string;
    }>(
      `
        SELECT id
        FROM parts
        WHERE lower(name) = lower($1)
          AND category = $2
          AND (brand IS NOT DISTINCT FROM $3)
        LIMIT 1
      `,
      [name, category, brand]
    );
    if (result?.rows?.[0]) {
      return this.deps.getPartById(result.rows[0].id, pool);
    }
    return null;
  }

  private buildEvent(
    supplierPartId: string,
    canonicalPartId: string,
    decision: 'matched' | 'created'
  ): AgentEventInput {
    return {
      workflowId: null,
      agentName: 'ProductDataAgent',
      taskType: 'product_data_match',
      inputData: { supplierPartId },
      outputData: { canonicalPartId, decision },
      reasoning: decision === 'matched' ? 'Matched to existing part' : 'Created new part',
    };
  }
}
