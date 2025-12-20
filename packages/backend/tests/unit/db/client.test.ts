import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkDatabaseConnection, closePool, getPool, initializeDatabase } from '../../../src/db/client.js';

const connectMock = vi.fn();
const endMock = vi.fn();
const onMock = vi.fn();
const queryMock = vi.fn();
const releaseMock = vi.fn();

vi.mock('pg', () => {
  class MockPool {
    connect = connectMock;
    end = endMock;
    on = onMock;
    query = queryMock;
  }

  return { Pool: MockPool };
});

describe('db client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectMock.mockResolvedValue({
      query: queryMock.mockResolvedValue({ rows: [{ ok: 1 }] }),
      release: releaseMock,
    });
    endMock.mockResolvedValue(undefined);
  });

  it('returns a singleton pool instance', () => {
    const first = getPool();
    const second = getPool();

    expect(first).toBe(second);
    expect(onMock).toHaveBeenCalledTimes(1);
  });

  it('runs a health check query and releases the client', async () => {
    await checkDatabaseConnection();

    expect(connectMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledWith('SELECT 1');
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('exits on initialization failure outside of tests, throws in test env', async () => {
    connectMock.mockRejectedValueOnce(new Error('boom'));

    await expect(initializeDatabase()).rejects.toThrow('boom');
    expect(connectMock).toHaveBeenCalledTimes(1);
  });

  it('closes the pool and resets the singleton', async () => {
    const pool = getPool();
    await closePool();
    const nextPool = getPool();

    expect(endMock).toHaveBeenCalledTimes(1);
    expect(nextPool).not.toBe(pool);
  });
});
