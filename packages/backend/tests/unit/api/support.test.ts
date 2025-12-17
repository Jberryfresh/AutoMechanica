import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import supportRouter from '../../../src/api/support.js';
import * as llmRouter from '../../../src/llm/router.js';

import type { RouterResult } from '../../../src/llm/router.js';

const app = express();
app.use(express.json());
app.use('/api', supportRouter);

describe('POST /support/message', () => {
  const llmSpy = vi.spyOn(llmRouter, 'routeLLM');

  beforeEach(() => {
    llmSpy.mockResolvedValue({
      output: 'Hello from support',
      reasoning: '',
      modelUsed: 'test-model',
      provider: 'local',
      tokens: { prompt: 10, completion: 20, total: 30 },
      costEstimate: 0.0,
      timestamp: new Date().toISOString(),
    } as RouterResult);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns reply when message is provided', async () => {
    const res = await request(app)
      .post('/api/support/message')
      .send({ message: 'Need help', partId: 'part123', vehicle: { year: 2020 } })
      .expect(200);

    const body = res.body as { reply: string };
    expect(body.reply).toBe('Hello from support');
    expect(llmSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        taskType: 'support_reply',
      })
    );
  });

  it('rejects missing message', async () => {
    await request(app).post('/api/support/message').send({}).expect(400);
  });
});
