import { describe, expect, it, vi } from 'vitest';

const originalEnv = { ...process.env };

describe('Memory backend factory', () => {
  it('returns pgvector backend by default', async () => {
    vi.resetModules();
    process.env = { ...originalEnv, MEMORY_BACKEND: 'pgvector' };
    const { createMemoryBackend } = await import('../../../src/memory/backend.js');
    const backend = createMemoryBackend();
    await expect(backend.query('test', [0.1, 0.2], 5)).resolves.toEqual([]);
  });

  it('throws when Qdrant is selected without URL', async () => {
    vi.resetModules();
    process.env = { ...originalEnv, MEMORY_BACKEND: 'qdrant', QDRANT_URL: undefined as unknown as string };
    await expect(async () => {
      const { createMemoryBackend } = await import('../../../src/memory/backend.js');
      createMemoryBackend();
    }).rejects.toThrow(/QDRANT_URL/);
  });
});

