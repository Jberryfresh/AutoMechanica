import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '../../src/index';

describe('health endpoint', () => {
  it('responds with service status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('backend');
    expect(response.body.environment).toBeDefined();
  });

  it('returns 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Not Found');
  });
});
