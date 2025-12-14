import { AnthropicProvider } from './providers/anthropic.js';
import { LocalProvider } from './providers/local.js';
import { OpenAIProvider } from './providers/openai.js';

import type { LLMProvider, ProviderResponse, ProviderTokens } from './providers/types.js';

export const ROUTER_TASK_TYPES = [
  'meta_reasoning',
  'fitment_analysis',
  'pricing_reasoning',
  'seo_generation',
  'support_reply',
  'normalization',
  'matching',
  'lightweight',
  'safety_check',
] as const;

export type RouterTaskType = (typeof ROUTER_TASK_TYPES)[number];

export interface RouterInput {
  taskType: RouterTaskType;
  payload: Record<string, unknown>;
}

export interface RouterResult {
  output: string;
  reasoning?: string;
  modelUsed: string;
  provider: string;
  tokens: ProviderTokens & { total: number };
  costEstimate: number;
  timestamp: string;
  raw?: unknown;
}

export interface RouterLogEvent {
  taskType: string;
  provider: string;
  model: string;
  latencyMs: number;
  success: boolean;
  error?: string;
}

export type RouterLogger = (event: RouterLogEvent) => void;

export interface RouterDeps {
  providers: Record<string, LLMProvider>;
  logger?: RouterLogger;
}

const defaultProviders: Record<string, LLMProvider> = {
  openai: new OpenAIProvider(),
  anthropic: new AnthropicProvider(),
  local: new LocalProvider(),
};

const resolveDeps = (deps?: Partial<RouterDeps>): RouterDeps => ({
  providers: { ...defaultProviders, ...(deps?.providers ?? {}) },
  logger: deps?.logger ?? defaultLogger,
});

interface RouteConfig {
  provider: keyof typeof defaultProviders;
  model: string;
  fallbackProvider?: keyof typeof defaultProviders;
}

const ROUTE_TABLE: Record<RouterTaskType, RouteConfig> = {
  meta_reasoning: { provider: 'openai', model: 'gpt-4o' },
  fitment_analysis: { provider: 'openai', model: 'gpt-4o-mini' },
  pricing_reasoning: { provider: 'openai', model: 'gpt-4o-mini' },
  seo_generation: { provider: 'openai', model: 'gpt-4o-mini' },
  support_reply: { provider: 'anthropic', model: 'claude-3-haiku' },
  normalization: { provider: 'openai', model: 'gpt-4o-mini', fallbackProvider: 'local' },
  matching: { provider: 'openai', model: 'gpt-4o-mini' },
  lightweight: { provider: 'local', model: 'llama3:instruct', fallbackProvider: 'openai' },
  safety_check: { provider: 'local', model: 'llama3:instruct', fallbackProvider: 'openai' },
};

const MODEL_COST_PER_1K: Record<string, number> = {
  'gpt-4o': 0.003,
  'gpt-4o-mini': 0.001,
  'claude-3-haiku': 0.0008,
  'llama3:instruct': 0.0002,
};

export const routeLLM = async (
  input: RouterInput,
  deps?: Partial<RouterDeps>
): Promise<RouterResult> => {
  const { providers, logger } = resolveDeps(deps);
  const route = ROUTE_TABLE[input.taskType];
  if (!route) throw new Error(`Unsupported taskType: ${input.taskType}`);

  const candidates = [route.provider, route.fallbackProvider].filter(Boolean) as string[];
  const start = Date.now();

  let lastError: Error | null = null;

  for (const providerKey of candidates) {
    const provider = providers[providerKey];
    if (!provider) continue;

    try {
      const response = await provider.generate({
        taskType: input.taskType,
        payload: input.payload,
        model: route.model,
      });

      const tokens = normalizeTokens(response);
      const cost = estimateCost(route.model, tokens);
      const result: RouterResult = {
        output: response.output,
        reasoning: response.reasoning,
        modelUsed: route.model,
        provider: provider.name,
        tokens,
        costEstimate: cost,
        timestamp: new Date().toISOString(),
        raw: response.raw,
      };

      logger?.({
        taskType: input.taskType,
        provider: provider.name,
        model: route.model,
        latencyMs: Date.now() - start,
        success: true,
      });

      return result;
    } catch (error: unknown) {
      lastError = error as Error;
      logger?.({
        taskType: input.taskType,
        provider: provider.name,
        model: route.model,
        latencyMs: Date.now() - start,
        success: false,
        error: (error as Error).message,
      });
    }
  }

  throw lastError ?? new Error(`No provider available for taskType ${input.taskType}`);
};

const normalizeTokens = (response: ProviderResponse): ProviderTokens & { total: number } => {
  const prompt = response.tokens?.prompt ?? 0;
  const completion = response.tokens?.completion ?? 0;
  const total = prompt + completion;
  return { prompt, completion, total };
};

const estimateCost = (model: string, tokens: ProviderTokens & { total: number }): number => {
  const rate = MODEL_COST_PER_1K[model] ?? 0.0005;
  return Number(((tokens.total / 1000) * rate).toFixed(6));
};

const defaultLogger: RouterLogger = (event) => {
  // eslint-disable-next-line no-console
  console.log('[llm-router]', JSON.stringify(event));
};
