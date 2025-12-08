/* eslint-disable import/order */
import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  FitmentUniqueConstraintError,
  FitmentValidationError,
  createFitment,
  deleteFitment,
  getFitmentForPartAndVehicle,
  listFitmentsForPart,
  listFitmentsForVehicle,
  updateFitment,
} from '../../../src/models/Fitment.js';
import type { Fitment } from '../../../src/models/Fitment.js';

import type { Pool } from 'pg';

interface FakeQueryResult<T = unknown> {
  rows: T[];
}

interface FakePool {
  query: (text: string, params?: unknown[]) => Promise<FakeQueryResult>;
}

interface FitmentRow {
  id: string;
  canonical_part_id: string;
  vehicle_id: string;
  confidence: number;
  evidence: Record<string, unknown> | null;
  source: string | null;
  created_at: string;
}

const makeFitment = (partial: Partial<Fitment> = {}): Fitment => ({
  id: partial.id ?? randomUUID(),
  canonicalPartId: partial.canonicalPartId ?? 'part-1',
  vehicleId: partial.vehicleId ?? 'vehicle-1',
  confidence: partial.confidence ?? 0.9,
  evidence: partial.evidence ?? { matched: ['engine'] },
  source: partial.source ?? 'agent',
  createdAt: partial.createdAt ?? new Date(),
});

const toRow = (f: Fitment): FitmentRow => ({
  id: f.id,
  canonical_part_id: f.canonicalPartId,
  vehicle_id: f.vehicleId,
  confidence: f.confidence,
  evidence: f.evidence,
  source: f.source,
  created_at: f.createdAt.toISOString(),
});

const createFakePool = (initial: Fitment[] = []): FakePool => {
  const fitments = [...initial];

  return {
    async query(text: string, params: unknown[] = []): Promise<FakeQueryResult> {
      await Promise.resolve();
      // Insert
      if (text.includes('INSERT INTO fitments')) {
        const [partId, vehicleId, confidence, evidence, source] = params as [
          string,
          string,
          number,
          Record<string, unknown> | null,
          string | null
        ];
        const duplicate = fitments.find(
          (f) => f.canonicalPartId === partId && f.vehicleId === vehicleId
        );
        if (duplicate) {
          const err = new Error('duplicate') as Error & { code?: string };
          err.code = '23505';
          throw err;
        }
        const fitment = makeFitment({
          id: randomUUID(),
          canonicalPartId: partId,
          vehicleId,
          confidence,
          evidence: evidence ?? null,
          source: source ?? null,
        });
        fitments.push(fitment);
        return { rows: [toRow(fitment)] };
      }

      // Update
      if (text.includes('UPDATE fitments')) {
        const [confidence, evidence, source, id] = params as [
          number | null,
          Record<string, unknown> | null,
          string | null,
          string
        ];
        const index = fitments.findIndex((f) => f.id === id);
        if (index === -1) return { rows: [] };
        const current = fitments[index];
        const updated = {
          ...current,
          confidence: confidence ?? current.confidence,
          evidence: evidence ?? current.evidence,
          source: source ?? current.source,
        };
        fitments[index] = updated;
        return { rows: [toRow(updated)] };
      }

      // List by part
      if (text.includes('WHERE canonical_part_id = $1') && text.includes('confidence >= $2')) {
        const partId = params[0] as string;
        const min = params[1] as number;
        const filtered = fitments
          .filter((f) => f.canonicalPartId === partId && f.confidence >= min)
          .sort((a, b) => b.confidence - a.confidence);
        return { rows: filtered.map(toRow) };
      }

      // List by vehicle
      if (text.includes('WHERE vehicle_id = $1') && text.includes('confidence >= $2')) {
        const vehicleId = params[0] as string;
        const min = params[1] as number;
        const filtered = fitments
          .filter((f) => f.vehicleId === vehicleId && f.confidence >= min)
          .sort((a, b) => b.confidence - a.confidence);
        return { rows: filtered.map(toRow) };
      }

      // Get by part+vehicle
      if (text.includes('canonical_part_id = $1') && text.includes('vehicle_id = $2') && !text.includes('confidence >=')) {
        const partId = params[0] as string;
        const vehicleId = params[1] as string;
        const found = fitments.find((f) => f.canonicalPartId === partId && f.vehicleId === vehicleId);
        return { rows: found ? [toRow(found)] : [] };
      }

      // Delete
      if (text.startsWith('DELETE FROM fitments')) {
        const id = params[0] as string;
        const index = fitments.findIndex((f) => f.id === id);
        if (index !== -1) fitments.splice(index, 1);
        return { rows: [] };
      }

      return { rows: [] };
    },
  };
};

describe('Fitment model', () => {
  it('creates a fitment and enforces uniqueness', async () => {
    const existing = makeFitment({ canonicalPartId: 'part-1', vehicleId: 'veh-1' });
    const pool = createFakePool([existing]) as unknown as Pool;

    await expect(
      createFitment({ canonicalPartId: 'part-1', vehicleId: 'veh-1', confidence: 0.9 }, pool)
    ).rejects.toBeInstanceOf(FitmentUniqueConstraintError);

    const created = await createFitment(
      { canonicalPartId: 'part-1', vehicleId: 'veh-2', confidence: 0.8, source: 'agent' },
      pool
    );
    expect(created.vehicleId).toBe('veh-2');
  });

  it('validates confidence range', async () => {
    const pool = createFakePool() as unknown as Pool;
    await expect(createFitment({ canonicalPartId: 'p', vehicleId: 'v', confidence: -0.1 }, pool)).rejects.toBeInstanceOf(
      FitmentValidationError
    );
  });

  it('lists fitments by part and vehicle with thresholds', async () => {
    const f1 = makeFitment({ canonicalPartId: 'p1', vehicleId: 'v1', confidence: 0.95 });
    const f2 = makeFitment({ canonicalPartId: 'p1', vehicleId: 'v2', confidence: 0.7 });
    const f3 = makeFitment({ canonicalPartId: 'p2', vehicleId: 'v1', confidence: 0.8 });
    const pool = createFakePool([f1, f2, f3]) as unknown as Pool;

    const byPart = await listFitmentsForPart('p1', 0.8, pool);
    expect(byPart).toHaveLength(1);
    expect(byPart[0].vehicleId).toBe('v1');

    const byVehicle = await listFitmentsForVehicle('v1', 0.75, pool);
    expect(byVehicle.map((f) => f.canonicalPartId)).toEqual(['p1', 'p2']);
  });

  it('updates and deletes fitments', async () => {
    const f = makeFitment({ confidence: 0.7 });
    const pool = createFakePool([f]) as unknown as Pool;

    const updated = await updateFitment(f.id, { confidence: 0.85 }, pool);
    expect(updated?.confidence).toBe(0.85);

    await deleteFitment(f.id, pool);
    const afterDelete = await getFitmentForPartAndVehicle(f.canonicalPartId, f.vehicleId, pool);
    expect(afterDelete).toBeNull();
  });
});
