import { routeLLM } from '../llm/router.js';
import { logAgentEvent, type AgentEventInput } from '../models/AgentEvent.js';
import { createFitment, type Fitment } from '../models/Fitment.js';
import { getPartById, type Part } from '../models/Part.js';

import type { Pool } from 'pg';

interface FitmentTaskPayload {
  canonicalPartId: string;
  vehicles: Array<{
    id: string;
    year?: number;
    make?: string;
    model?: string;
    engine?: string;
    position?: string;
  }>;
}

export interface FitmentDeps {
  getPartById: typeof getPartById;
  createFitment: typeof createFitment;
  logAgentEvent: typeof logAgentEvent;
  routeLLM: typeof routeLLM;
}

const defaultDeps: FitmentDeps = {
  getPartById,
  createFitment,
  logAgentEvent,
  routeLLM,
};

export class FitmentAgent {
  constructor(private readonly deps: FitmentDeps = defaultDeps) {}

  async runTask(task: { payload: FitmentTaskPayload }, pool?: Pool): Promise<Fitment[]> {
    const payload = task.payload;
    if (!payload?.canonicalPartId) throw new Error('canonicalPartId is required');
    if (!payload.vehicles?.length) throw new Error('vehicles are required');

    const part = await this.deps.getPartById(payload.canonicalPartId, pool);
    if (!part) throw new Error(`Part ${payload.canonicalPartId} not found`);

    const fitments: Fitment[] = [];
    for (const vehicle of payload.vehicles) {
      const confidence = this.computeConfidence(part, vehicle);
      const evidence = this.buildEvidence(part, vehicle, confidence);

      const fitment = await this.deps.createFitment(
        {
          canonicalPartId: part.id,
          vehicleId: vehicle.id,
          confidence,
          evidence,
          source: 'FitmentAgent',
        },
        pool
      );
      fitments.push(fitment);

      await this.deps.logAgentEvent(this.buildEvent(part.id, vehicle.id, confidence, evidence), pool);
    }

    return fitments;
  }

  private computeConfidence(
    part: Part,
    vehicle: { engine?: string; position?: string }
  ): number {
    const attributes = part.attributes ?? {};
    let score = 0.5;
    const evidence: string[] = [];

    const partPosition = typeof attributes.position === 'string' ? attributes.position.toLowerCase() : null;
    if (partPosition && vehicle.position && vehicle.position.toLowerCase() === partPosition) {
      score += 0.3;
      evidence.push('position_match');
    }

    const partEngine = typeof attributes.engine === 'string' ? attributes.engine.toLowerCase() : null;
    if (partEngine && vehicle.engine && vehicle.engine.toLowerCase().includes(partEngine)) {
      score += 0.2;
      evidence.push('engine_match');
    }

    // Clamp between 0 and 1
    score = Math.max(0, Math.min(1, score));
    if (!evidence.length) evidence.push('base_confidence');

    return score;
  }

  private buildEvidence(
    part: Part,
    vehicle: { year?: number; make?: string; model?: string; engine?: string; position?: string },
    confidence: number
  ): Record<string, unknown> {
    const level =
      confidence >= 0.9 ? 'guaranteed' : confidence >= 0.75 ? 'likely' : 'uncertain';

    return {
      partAttributes: part.attributes,
      vehicle,
      confidence,
      level,
      notes: `Confidence level ${level}`,
    };
  }

  private buildEvent(
    partId: string,
    vehicleId: string,
    confidence: number,
    evidence: Record<string, unknown>
  ): AgentEventInput {
    return {
      workflowId: null,
      agentName: 'FitmentAgent',
      taskType: 'fitment_analysis',
      inputData: { partId, vehicleId },
      outputData: { confidence, evidence },
      reasoning: evidence.notes ? String(evidence.notes) : 'Computed fitment confidence',
    };
  }
}
