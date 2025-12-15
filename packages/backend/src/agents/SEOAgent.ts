import { routeLLM } from '../llm/router.js';
import { logAgentEvent, type AgentEventInput } from '../models/AgentEvent.js';
import { getPartById, updatePart } from '../models/Part.js';

import type { Pool } from 'pg';

interface SEOTaskPayload {
  canonicalPartId: string;
}

export interface SEODeps {
  getPartById: typeof getPartById;
  updatePart: typeof updatePart;
  routeLLM: typeof routeLLM;
  logAgentEvent: typeof logAgentEvent;
}

const defaultDeps: SEODeps = {
  getPartById,
  updatePart,
  routeLLM,
  logAgentEvent,
};

const FORBIDDEN_PATTERNS = [/lifetime\s+guarantee/i, /oem\s+/i];

export class SEOAgent {
  constructor(private readonly deps: SEODeps = defaultDeps) {}

  async runTask(task: { payload: SEOTaskPayload }, pool?: Pool): Promise<string> {
    const partId = task.payload?.canonicalPartId;
    if (!partId) throw new Error('canonicalPartId is required');

    const part = await this.deps.getPartById(partId, pool);
    if (!part) throw new Error(`Part ${partId} not found`);

    const baseDescription = await this.generateDescription(part);
    const sanitized = this.sanitizeDescription(baseDescription);

    const updated = await this.deps.updatePart(
      part.id,
      {
        name: part.name,
        category: part.category,
        brand: part.brand,
        description: sanitized,
        attributes: part.attributes,
      },
      pool
    );

    await this.deps.logAgentEvent(this.buildEvent(part.id, sanitized), pool);

    return updated.description ?? '';
  }

  private async generateDescription(part: {
    name: string;
    category: string;
    brand: string | null;
    attributes: Record<string, unknown>;
  }): Promise<string> {
    try {
      const result = await this.deps.routeLLM({
        taskType: 'seo_generation',
        payload: {
          name: part.name,
          category: part.category,
          brand: part.brand,
          attributes: part.attributes,
        },
      });
      if (result.output) return result.output;
    } catch {
      // ignore LLM failure and fall back
    }

    const pieces = [
      part.brand ? `${part.brand} ${part.name}` : part.name,
      `Category: ${part.category}`,
    ];
    if (part.attributes) {
      const attrs = Object.entries(part.attributes)
        .slice(0, 4)
        .map(([k, v]) => `${k}: ${String(v)}`);
      if (attrs.length) pieces.push(`Features: ${attrs.join(', ')}`);
    }
    return pieces.join(' — ');
  }

  private sanitizeDescription(text: string): string {
    let output = text.slice(0, 500); // length cap
    FORBIDDEN_PATTERNS.forEach((pattern) => {
      output = output.replace(pattern, '');
    });
    return output.trim();
  }

  private buildEvent(partId: string, description: string): AgentEventInput {
    return {
      workflowId: null,
      agentName: 'SEOAgent',
      taskType: 'seo_generation',
      inputData: { partId },
      outputData: { description },
      reasoning: 'Generated SEO description',
    };
  }
}
