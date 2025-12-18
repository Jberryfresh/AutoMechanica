import fs from 'fs';
import path from 'path';

import { describe, expect, it } from 'vitest';

import { FitmentAgent } from '../../../src/agents/FitmentAgent.js';

import type { FitmentDeps } from '../../../src/agents/FitmentAgent.js';
import type { AgentEvent } from '../../../src/models/AgentEvent.js';
import type { Fitment } from '../../../src/models/Fitment.js';
import type { Part } from '../../../src/models/Part.js';

type GoldScenario = {
  scenario: string;
  part: { id: string; attributes: Record<string, unknown> };
  vehicle: { id: string; engine?: string; position?: string };
  expected_fit: boolean;
};

const loadGold = (): GoldScenario[] => {
  const fixturePath = path.join(process.cwd(), 'tests/fixtures/fitment_gold.json');
  const raw = fs.readFileSync(fixturePath, 'utf-8');
  return JSON.parse(raw) as GoldScenario[];
};

const createAgentWithMocks = (parts: Record<string, Part>): FitmentAgent => {
  const deps: FitmentDeps = {
    getPartById: (id: string) => Promise.resolve(parts[id] ?? null),
    createFitment: (input): Promise<Fitment> =>
      Promise.resolve({
        id: `fit-${input.vehicleId}`,
        canonicalPartId: input.canonicalPartId,
        vehicleId: input.vehicleId,
        confidence: input.confidence,
        evidence: input.evidence,
        source: input.source,
        createdAt: new Date(),
      } as Fitment),
    logAgentEvent: (): Promise<AgentEvent> =>
      Promise.resolve({
        id: 'event-1',
        workflowId: null,
        agentName: 'FitmentAgent',
        taskType: 'fitment_analysis',
        inputData: {},
        outputData: {},
        reasoning: null,
        createdAt: new Date(),
      }),
    routeLLM: () =>
      Promise.resolve({
        output: '',
        modelUsed: 'local',
        provider: 'local',
        tokens: { prompt: 0, completion: 0, total: 0 },
        costEstimate: 0,
        timestamp: new Date().toISOString(),
      }),
  };
  return new FitmentAgent(deps);
};

describe('Fitment gold harness', () => {
  it('evaluates fitment accuracy against gold dataset', async () => {
    const gold = loadGold();
    const parts = Object.fromEntries(
      gold.map((g) => [
        g.part.id,
        {
          id: g.part.id,
          name: g.part.id,
          category: 'brakes',
          description: null,
          brand: null,
          attributes: g.part.attributes,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Part,
      ])
    );

    const agent = createAgentWithMocks(parts);

    let correct = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    for (const scenario of gold) {
      const result = await agent.runTask({
        payload: {
          canonicalPartId: scenario.part.id,
          vehicles: [scenario.vehicle],
        },
      });

      const confidence = result[0]?.confidence ?? 0;
      const predictedFit = confidence >= 0.75;
      if (predictedFit === scenario.expected_fit) {
        correct += 1;
      } else if (predictedFit && !scenario.expected_fit) {
        falsePositives += 1;
      } else if (!predictedFit && scenario.expected_fit) {
        falseNegatives += 1;
      }
    }

    const accuracy = correct / gold.length;
    // Log summary for visibility
    // eslint-disable-next-line no-console
    console.info(
      `[fitment-harness] accuracy=${accuracy.toFixed(
        2
      )}, falsePositives=${falsePositives}, falseNegatives=${falseNegatives}`
    );

    expect(accuracy).toBeGreaterThanOrEqual(0.5);
    expect(falsePositives + falseNegatives).toBeLessThanOrEqual(gold.length);
  });
});
