import { logAgentEvent, type AgentEventInput } from '../models/AgentEvent.js';
import { getPartById, updatePart } from '../models/Part.js';
import { listSupplierPartsByCanonicalId, type SupplierPart } from '../models/SupplierPart.js';

import type { Pool } from 'pg';

interface PricingTaskPayload {
  canonicalPartId: string;
  margin?: number; // decimal (e.g., 0.4 = 40%)
  maxMarkup?: number; // optional cap on markup multiplier
  minMargin?: number; // optional floor
}

export interface PricingDeps {
  listSupplierPartsByCanonicalId: typeof listSupplierPartsByCanonicalId;
  getPartById: typeof getPartById;
  updatePart: typeof updatePart;
  logAgentEvent: typeof logAgentEvent;
}

const defaultDeps: PricingDeps = {
  listSupplierPartsByCanonicalId,
  getPartById,
  updatePart,
  logAgentEvent,
};

const DEFAULT_MARGIN = 0.4;
const DEFAULT_MIN_MARGIN = 0.2;

export class PricingAgent {
  constructor(private readonly deps: PricingDeps = defaultDeps) {}

  async runTask(task: { payload: PricingTaskPayload }, pool?: Pool): Promise<{
    price: number;
    supplierPartId: string;
  }> {
    const payload = task.payload;
    if (!payload?.canonicalPartId) throw new Error('canonicalPartId is required');

    const supplierParts = await this.deps.listSupplierPartsByCanonicalId(payload.canonicalPartId, pool);
    if (!supplierParts.length) throw new Error('No supplier parts available for pricing');

    const cheapest = this.pickCheapest(supplierParts);
    if (cheapest.cost === null || cheapest.cost === undefined) {
      throw new Error('Cheapest supplier part missing cost');
    }

    const margin = payload.margin ?? DEFAULT_MARGIN;
    const minMargin = payload.minMargin ?? DEFAULT_MIN_MARGIN;
    let price = cheapest.cost * (1 + Math.max(margin, minMargin));
    if (payload.maxMarkup !== undefined) {
      price = Math.min(price, cheapest.cost * (1 + payload.maxMarkup));
    }

    const part = await this.deps.getPartById(payload.canonicalPartId, pool);
    if (!part) throw new Error(`Part ${payload.canonicalPartId} not found`);

    const updatedAttributes = {
      ...(part.attributes ?? {}),
      pricing: {
        supplierPartId: cheapest.id,
        cost: cheapest.cost,
        marginApplied: Math.max(margin, minMargin),
        price,
      },
    };

    await this.deps.updatePart(
      part.id,
      { attributes: updatedAttributes, name: part.name, category: part.category, brand: part.brand, description: part.description },
      pool
    );

    await this.deps.logAgentEvent(this.buildEvent(part.id, cheapest.id, price, cheapest.cost, margin), pool);

    return { price, supplierPartId: cheapest.id };
  }

  private pickCheapest(parts: SupplierPart[]): SupplierPart {
    const available = parts.filter((p) => typeof p.cost === 'number');
    if (!available.length) throw new Error('No cost data available');
    const sorted = [...available].sort((a, b) => (a.cost ?? Infinity) - (b.cost ?? Infinity));
    return sorted[0];
  }

  private buildEvent(
    partId: string,
    supplierPartId: string,
    price: number,
    cost: number,
    margin: number
  ): AgentEventInput {
    return {
      workflowId: null,
      agentName: 'PricingAgent',
      taskType: 'pricing_reasoning',
      inputData: { partId, supplierPartId, cost, margin },
      outputData: { price },
      reasoning: `Applied margin ${margin} to cost ${cost}`,
    };
  }
}
