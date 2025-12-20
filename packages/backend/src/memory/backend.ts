import { env } from '../lib/env.js';

type VectorPayload = Record<string, unknown>;

export type VectorRecord = {
  id: string;
  vector: number[];
  payload?: VectorPayload;
};

export type QueryResult = {
  id: string;
  score: number;
  payload?: VectorPayload;
};

export interface MemoryBackend {
  upsert(collection: string, records: VectorRecord[]): Promise<void>;
  query(
    collection: string,
    vector: number[],
    limit: number,
    filter?: VectorPayload
  ): Promise<QueryResult[]>;
  delete(collection: string, ids: string[]): Promise<void>;
  health(): Promise<boolean>;
}

class PgvectorMemoryBackend implements MemoryBackend {
  // Placeholder implementation until a dedicated pgvector storage layer is introduced.
  async upsert(collection: string, records: VectorRecord[]): Promise<void> {
    // eslint-disable-next-line no-console
    console.debug(`[pgvector-memory] upsert(${collection}) called with ${records.length} records`);
    await Promise.resolve();
  }

  async query(
    collection: string,
    vector: number[],
    limit: number,
    _filter?: VectorPayload
  ): Promise<QueryResult[]> {
    // eslint-disable-next-line no-console
    console.debug(
      `[pgvector-memory] query(${collection}) called with dimension ${vector.length}, limit=${limit}`
    );
    return Promise.resolve([]);
  }

  async delete(collection: string, ids: string[]): Promise<void> {
    // eslint-disable-next-line no-console
    console.debug(`[pgvector-memory] delete(${collection}) called with ${ids.length} ids`);
    await Promise.resolve();
  }

  async health(): Promise<boolean> {
    // No-op placeholder; real implementation will run a lightweight query.
    return Promise.resolve(true);
  }
}

class QdrantMemoryBackend implements MemoryBackend {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) {
      headers['api-key'] = this.apiKey;
    }
    return headers;
  }

  async upsert(collection: string, records: VectorRecord[]): Promise<void> {
    if (!records.length) return;
    await fetch(`${this.baseUrl}/collections/${collection}/points`, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        points: records.map((r) => ({
          id: r.id,
          vector: r.vector,
          payload: r.payload ?? {},
        })),
      }),
    });
  }

  async query(
    collection: string,
    vector: number[],
    limit: number,
    filter?: VectorPayload
  ): Promise<QueryResult[]> {
    const response = await fetch(`${this.baseUrl}/collections/${collection}/points/search`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        vector,
        limit,
        filter,
      }),
    });
    if (!response.ok) return [];
    const data = (await response.json()) as {
      result?: Array<{ id: string; score: number; payload?: VectorPayload }>;
    };
    return data.result?.map((item) => ({ id: String(item.id), score: item.score, payload: item.payload })) ?? [];
  }

  async delete(collection: string, ids: string[]): Promise<void> {
    if (!ids.length) return;
    await fetch(`${this.baseUrl}/collections/${collection}/points/delete`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({ points: ids }),
    });
  }

  async health(): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/readyz`, { headers: this.buildHeaders() });
    return response.ok;
  }
}

export function createMemoryBackend(): MemoryBackend {
  if (env.MEMORY_BACKEND === 'qdrant') {
    if (!env.QDRANT_URL) {
      throw new Error('QDRANT_URL is required when MEMORY_BACKEND=qdrant');
    }
    return new QdrantMemoryBackend(env.QDRANT_URL, env.QDRANT_API_KEY);
  }
  // Default to pgvector-backed placeholder.
  return new PgvectorMemoryBackend();
}
