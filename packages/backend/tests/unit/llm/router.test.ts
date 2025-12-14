import { describe, expect, it, vi } from 'vitest';

import { routeLLM, type RouterResult, type RouterTaskType } from '../../../src/llm/router.js';

import type {
  LLMProvider,
  ProviderRequest,
  ProviderResponse,
} from '../../../src/llm/providers/types.js';

const createProvider = (
  name: string,
  impl: (req: ProviderRequest) => Promise<ProviderResponse>
): LLMProvider => ({
  name,
  generate: impl,
});

describe('LLM Router', () => {
  it('routes to primary provider based on task type', async () => {
    const logger = vi.fn();
    const provider = createProvider('openai', (req) =>
      Promise.resolve({
        output: `handled:${req.taskType}`,
        reasoning: 'r',
        tokens: { prompt: 100, completion: 50 },
      })
    );

    const result = await routeLLM(
      { taskType: 'meta_reasoning', payload: { prompt: 'hi' } },
      { providers: { openai: provider }, logger }
    );

    expect(result.output).toBe('handled:meta_reasoning');
    expect(result.provider).toBe('openai');
    expect(result.tokens.total).toBe(150);
    expect(logger).toHaveBeenCalled();
  });

  it('falls back to secondary provider on failure', async () => {
    const logger = vi.fn();
    const failing = createProvider('openai', () => Promise.reject(new Error('primary failed')));
    const fallback = createProvider('local', () =>
      Promise.resolve({
        output: 'fallback',
        tokens: { prompt: 10, completion: 20 },
      })
    );

    const result = await routeLLM(
      { taskType: 'lightweight', payload: {} },
      { providers: { openai: failing, local: fallback }, logger }
    );

    expect(result.output).toBe('fallback');
    expect(result.provider).toBe('local');
    expect(logger).toHaveBeenCalled();
  });

  it('throws for unsupported task types', async () => {
    const routerCall = routeLLM({ taskType: 'unknown_task' as RouterTaskType, payload: {} });
    await expect(routerCall).rejects.toThrow('Unsupported taskType');
  });

  it('computes cost estimate from token counts', async () => {
    const provider = createProvider('openai', () =>
      Promise.resolve({
        output: 'cost-test',
        tokens: { prompt: 500, completion: 500 },
      })
    );

    const result: RouterResult = await routeLLM(
      { taskType: 'matching', payload: {} },
      { providers: { openai: provider } }
    );

    expect(result.tokens.total).toBe(1000);
    expect(result.costEstimate).toBeGreaterThan(0);
  });
});
