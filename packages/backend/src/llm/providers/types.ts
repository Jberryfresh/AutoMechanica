export interface ProviderRequest {
  taskType: string;
  payload: Record<string, unknown>;
  model: string;
}

export interface ProviderTokens {
  prompt: number;
  completion: number;
}

export interface ProviderResponse {
  output: string;
  reasoning?: string;
  tokens?: ProviderTokens;
  raw?: unknown;
}

export interface LLMProvider {
  name: string;
  generate: (request: ProviderRequest) => Promise<ProviderResponse>;
}
