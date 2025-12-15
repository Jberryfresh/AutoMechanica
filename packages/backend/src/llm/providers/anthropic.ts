import type { LLMProvider, ProviderRequest, ProviderResponse } from './types.js';

const DEFAULT_OUTPUT = 'ok';

/** Stubbed Anthropic provider adapter; replace with real API calls in later phase. */
export class AnthropicProvider implements LLMProvider {
  readonly name = 'anthropic';

  generate(request: ProviderRequest): Promise<ProviderResponse> {
    const output = (request.payload.output as string) ?? DEFAULT_OUTPUT;
    return Promise.resolve({
      output,
      reasoning: request.payload.reasoning as string | undefined,
      tokens: {
        prompt: 180,
        completion: 350,
      },
      raw: {
        provider: this.name,
        model: request.model,
      },
    });
  }
}
