import request, { type Response as SupertestResponse } from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '../../src/index.js';

describe('health endpoint', () => {
  it('responds with service status', async () => {
    const response: SupertestResponse = await request(app).get('/api/health');
    const body = response.body as {
      status: string;
      service: string;
      environment: string;
    };

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('backend');
    expect(body.environment).toBeDefined();
  });

  it('returns 404 for unknown routes', async () => {
    const response: SupertestResponse = await request(app).get('/api/unknown-route');
    const body = response.body as { error: string; path: string };

    expect(response.status).toBe(404);
    expect(body.error).toBe('Not Found');
  });
});
