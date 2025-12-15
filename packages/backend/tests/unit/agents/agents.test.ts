import { describe, expect, it } from 'vitest';

import { FitmentAgent } from '../../../src/agents/FitmentAgent.js';
import { PricingAgent } from '../../../src/agents/PricingAgent.js';
import { ProductDataAgent } from '../../../src/agents/ProductDataAgent.js';
import { SEOAgent } from '../../../src/agents/SEOAgent.js';
import { SupplierNormalizationAgent } from '../../../src/agents/SupplierNormalizationAgent.js';

import type { RouterResult } from '../../../src/llm/router.js';
import type { AgentEventInput } from '../../../src/models/AgentEvent.js';
import type { Fitment } from '../../../src/models/Fitment.js';
import type { Part } from '../../../src/models/Part.js';
import type { SupplierPart } from '../../../src/models/SupplierPart.js';
import type { Pool } from 'pg';

describe('Agents', () => {
  it('SupplierNormalizationAgent normalizes and logs', async () => {
    const supplierParts: SupplierPart[] = [
      {
        id: 'sp1',
        supplierId: 'sup',
        supplierSku: 'sku1',
        rawData: { name: 'front brake pad', brand: 'ACME', position: 'front' },
        normalizedData: null,
        canonicalPartId: null,
        cost: 10,
        availability: null,
        leadTimeDays: null,
        createdAt: new Date(),
      },
    ];
    const parts: Part[] = [];
    const events: AgentEventInput[] = [];

    const agent = new SupplierNormalizationAgent({
      getSupplierPartById: (id: string): Promise<SupplierPart | null> =>
        Promise.resolve(supplierParts.find((s) => s.id === id) ?? null),
      updateNormalizedData: (
        id: string,
        data: Record<string, unknown> | null
      ): Promise<SupplierPart | null> => {
        const sp = supplierParts.find((s) => s.id === id);
        if (sp) sp.normalizedData = data;
        return Promise.resolve(sp ?? null);
      },
      attachCanonicalPart: (id: string, partId: string | null): Promise<SupplierPart | null> => {
        const sp = supplierParts.find((s) => s.id === id);
        if (sp) sp.canonicalPartId = partId;
        return Promise.resolve(sp ?? null);
      },
      createPart: (input): Promise<Part> => {
        const part: Part = {
          id: `p${parts.length + 1}`,
          name: input.name,
          category: input.category,
          brand: input.brand ?? null,
          description: input.description ?? null,
          attributes: input.attributes ?? {},
          createdAt: new Date(),
        };
        parts.push(part);
        return Promise.resolve(part);
      },
      routeLLM: (): Promise<RouterResult> =>
        Promise.resolve({
          output: 'normalized',
          reasoning: 'r',
          modelUsed: 'stub',
          provider: 'stub',
          tokens: { prompt: 0, completion: 0, total: 0 },
          costEstimate: 0,
          timestamp: new Date().toISOString(),
        }),
      logAgentEvent: (event: AgentEventInput): Promise<{
        id: string;
        workflowId: string | null;
        agentName: string;
        taskType: string;
        inputData: Record<string, unknown>;
        outputData: Record<string, unknown>;
        reasoning: string | null;
        createdAt: Date;
      }> => {
        events.push(event);
        return Promise.resolve({
          id: 'e1',
          workflowId: null,
          agentName: event.agentName,
          taskType: event.taskType,
          inputData: event.inputData ?? {},
          outputData: event.outputData ?? {},
          reasoning: event.reasoning ?? null,
          createdAt: new Date(),
        });
      },
    });

    await agent.runTask({ payload: { supplierPartId: 'sp1' } });

    expect(supplierParts[0]?.normalizedData).not.toBeNull();
    expect(supplierParts[0]?.canonicalPartId).toBeDefined();
    expect(events.length).toBe(1);
  });

  it('ProductDataAgent matches existing part or creates new', async () => {
    const supplierParts: SupplierPart[] = [
      {
        id: 'sp1',
        supplierId: 'sup',
        supplierSku: 'sku1',
        rawData: {},
        normalizedData: { name: 'Brake Pad', category: 'brakes', brand: 'ACME', attributes: {} },
        canonicalPartId: null,
        cost: null,
        availability: null,
        leadTimeDays: null,
        createdAt: new Date(),
      },
    ];
    const parts: Part[] = [
      {
        id: 'p1',
        name: 'Brake Pad',
        category: 'brakes',
        brand: 'ACME',
        description: null,
        attributes: {},
        createdAt: new Date(),
      },
    ];
    const events: AgentEventInput[] = [];

    const agent = new ProductDataAgent({
      getSupplierPartById: (id: string): Promise<SupplierPart | null> =>
        Promise.resolve(supplierParts.find((s) => s.id === id) ?? null),
      listSupplierPartsByCanonicalId: (): Promise<SupplierPart[]> => Promise.resolve(supplierParts),
      attachCanonicalPart: (id: string, partId: string | null): Promise<SupplierPart | null> => {
        const sp = supplierParts.find((s) => s.id === id);
        if (sp) sp.canonicalPartId = partId;
        return Promise.resolve(sp ?? null);
      },
      createPart: (input): Promise<Part> => {
        const part: Part = {
          id: `p${parts.length + 1}`,
          name: input.name,
          category: input.category,
          brand: input.brand ?? null,
          description: input.description ?? null,
          attributes: input.attributes ?? {},
          createdAt: new Date(),
        };
        parts.push(part);
        return Promise.resolve(part);
      },
      getPartById: (id: string): Promise<Part | null> =>
        Promise.resolve(parts.find((p) => p.id === id) ?? null),
      updatePart: (id: string, updates): Promise<Part> => {
        const idx = parts.findIndex((p) => p.id === id);
        if (idx >= 0) {
          parts[idx] = { ...parts[idx], ...updates, attributes: updates.attributes ?? parts[idx].attributes };
          return Promise.resolve(parts[idx]);
        }
        return Promise.reject(new Error('part not found'));
      },
      logAgentEvent: (event: AgentEventInput): Promise<{
        id: string;
        workflowId: string | null;
        agentName: string;
        taskType: string;
        inputData: Record<string, unknown>;
        outputData: Record<string, unknown>;
        reasoning: string | null;
        createdAt: Date;
      }> => {
        events.push(event);
        return Promise.resolve({
          id: 'e1',
          workflowId: null,
          agentName: event.agentName,
          taskType: event.taskType,
          inputData: event.inputData ?? {},
          outputData: event.outputData ?? {},
          reasoning: event.reasoning ?? null,
          createdAt: new Date(),
        });
      },
    });

    const pool = {
      // simulate query for existing part
      query: async (): Promise<{ rows: Array<{ id: string }> }> => {
        await Promise.resolve();
        return { rows: [{ id: 'p1' }] };
      },
    } as unknown as Pool;

    await agent.runTask({ payload: { supplierPartId: 'sp1' } }, pool);

    expect(supplierParts[0]?.canonicalPartId).toBe('p1');
    expect(events.length).toBe(1);
  });

  it('FitmentAgent creates fitment entries with confidence', async () => {
    const fitments: Fitment[] = [];
    const events: AgentEventInput[] = [];
    const part: Part = {
      id: 'part1',
      name: 'Rotor',
      category: 'brakes',
      brand: 'ACME',
      description: null,
      attributes: { position: 'front', engine: 'v6' },
      createdAt: new Date(),
    };

    const agent = new FitmentAgent({
      getPartById: (): Promise<Part> => Promise.resolve(part),
      createFitment: (input): Promise<Fitment> => {
        const fitment: Fitment = {
          id: `f${fitments.length + 1}`,
          canonicalPartId: input.canonicalPartId,
          vehicleId: input.vehicleId,
          confidence: input.confidence,
          evidence: input.evidence ?? null,
          source: input.source ?? null,
          createdAt: new Date(),
        };
        fitments.push(fitment);
        return Promise.resolve(fitment);
      },
      logAgentEvent: (event: AgentEventInput): Promise<{
        id: string;
        workflowId: string | null;
        agentName: string;
        taskType: string;
        inputData: Record<string, unknown>;
        outputData: Record<string, unknown>;
        reasoning: string | null;
        createdAt: Date;
      }> => {
        events.push(event);
        return Promise.resolve({
          id: 'e1',
          workflowId: null,
          agentName: event.agentName,
          taskType: event.taskType,
          inputData: event.inputData ?? {},
          outputData: event.outputData ?? {},
          reasoning: event.reasoning ?? null,
          createdAt: new Date(),
        });
      },
      routeLLM: (): Promise<never> => Promise.reject(new Error('not used')),
    });

    const results = await agent.runTask({
      payload: {
        canonicalPartId: 'part1',
        vehicles: [{ id: 'veh1', engine: 'v6', position: 'front' }],
      },
    });

    expect(results[0]?.confidence).toBeGreaterThan(0.7);
    expect(fitments).toHaveLength(1);
    expect(events.length).toBe(1);
  });

  it('PricingAgent picks cheapest supplier and enforces margin', async () => {
    const supplierParts: SupplierPart[] = [
      {
        id: 'sp1',
        supplierId: 's1',
        supplierSku: 'sku1',
        rawData: {},
        normalizedData: null,
        canonicalPartId: 'part1',
        cost: 50,
        availability: null,
        leadTimeDays: null,
        createdAt: new Date(),
      },
      {
        id: 'sp2',
        supplierId: 's2',
        supplierSku: 'sku2',
        rawData: {},
        normalizedData: null,
        canonicalPartId: 'part1',
        cost: 40,
        availability: null,
        leadTimeDays: null,
        createdAt: new Date(),
      },
    ];
    const part: Part = {
      id: 'part1',
      name: 'Rotor',
      category: 'brakes',
      brand: 'ACME',
      description: null,
      attributes: {},
      createdAt: new Date(),
    };

    const agent = new PricingAgent({
      listSupplierPartsByCanonicalId: (): Promise<SupplierPart[]> => Promise.resolve(supplierParts),
      getPartById: (): Promise<Part> => Promise.resolve(part),
      updatePart: (id: string, updates): Promise<Part> => {
        if (id !== part.id) throw new Error('wrong part');
        Object.assign(part, updates);
        return Promise.resolve(part);
      },
      logAgentEvent: (): Promise<{
        id: string;
        workflowId: null;
        agentName: string;
        taskType: string;
        inputData: Record<string, unknown>;
        outputData: Record<string, unknown>;
        reasoning: string | null;
        createdAt: Date;
      }> =>
        Promise.resolve({
          id: 'e1',
          workflowId: null,
          agentName: 'PricingAgent',
          taskType: 'pricing_reasoning',
          inputData: {},
          outputData: {},
          reasoning: null,
          createdAt: new Date(),
        }),
    });

    const result = await agent.runTask({ payload: { canonicalPartId: 'part1', margin: 0.25 } });

    expect(result.supplierPartId).toBe('sp2');
    expect(result.price).toBeGreaterThan(40);
    const pricing = (part.attributes as { pricing?: { price?: number } }).pricing;
    expect(pricing?.price).toBe(result.price);
  });

  it('SEOAgent generates sanitized description', async () => {
    const part: Part = {
      id: 'part1',
      name: 'Brake Pad',
      category: 'brakes',
      brand: 'ACME',
      description: null,
      attributes: { position: 'front' },
      createdAt: new Date(),
    };
    let savedDescription: string | null = null;

    const agent = new SEOAgent({
      getPartById: (): Promise<Part> => Promise.resolve(part),
      updatePart: (id: string, updates): Promise<Part> => {
        if (id !== part.id) throw new Error('bad id');
        savedDescription = updates.description ?? null;
        return Promise.resolve({ ...part, ...updates });
      },
      routeLLM: (): Promise<RouterResult> =>
        Promise.resolve({
          output: 'Great part with lifetime guarantee for OEM fit',
          reasoning: 'stub',
          modelUsed: 'stub',
          provider: 'stub',
          tokens: { prompt: 0, completion: 0, total: 0 },
          costEstimate: 0,
          timestamp: new Date().toISOString(),
        }),
      logAgentEvent: (): Promise<{
        id: string;
        workflowId: null;
        agentName: string;
        taskType: string;
        inputData: Record<string, unknown>;
        outputData: Record<string, unknown>;
        reasoning: string | null;
        createdAt: Date;
      }> =>
        Promise.resolve({
          id: 'e1',
          workflowId: null,
          agentName: 'SEOAgent',
          taskType: 'seo_generation',
          inputData: {},
          outputData: {},
          reasoning: null,
          createdAt: new Date(),
        }),
    });

    const description = await agent.runTask({ payload: { canonicalPartId: 'part1' } });

    expect(description.toLowerCase()).not.toContain('lifetime');
    expect(description.toLowerCase()).not.toContain('oem');
    expect(savedDescription).toBe(description);
  });
});
