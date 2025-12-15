import type { LLMProvider, ProviderRequest, ProviderResponse } from './types.js';

const DEFAULT_OUTPUT = 'ok';

/** Stubbed local provider (e.g., Ollama); intended for offline/testing fallback. */
export class LocalProvider implements LLMProvider {
  readonly name = 'local';

  generate(request: ProviderRequest): Promise<ProviderResponse> {
    const output = (request.payload.output as string) ?? DEFAULT_OUTPUT;
    return Promise.resolve({
      output,
      reasoning: request.payload.reasoning as string | undefined,
      tokens: {
        prompt: 100,
        completion: 200,
      },
      raw: {
        provider: this.name,
        model: request.model,
      },
    });
  }
}
