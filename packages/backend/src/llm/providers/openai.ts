import type { LLMProvider, ProviderRequest, ProviderResponse } from './types.js';

const DEFAULT_OUTPUT = 'ok';

/** Stubbed OpenAI provider adapter; can be replaced with real API wiring later. */
export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai';

  generate(request: ProviderRequest): Promise<ProviderResponse> {
    // In lieu of real API calls, return a deterministic stub for tests and early integration.
    const output = (request.payload.output as string) ?? DEFAULT_OUTPUT;
    return Promise.resolve({
      output,
      reasoning: request.payload.reasoning as string | undefined,
      tokens: {
        prompt: 200,
        completion: 400,
      },
      raw: {
        provider: this.name,
        model: request.model,
      },
    });
  }
}
