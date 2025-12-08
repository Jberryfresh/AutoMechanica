/* eslint-disable import/order */
import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  SupplierPartUniqueConstraintError,
  attachCanonicalPart,
  createSupplierPart,
  getSupplierPartById,
  listSupplierPartsByCanonicalId,
  listUnmappedSupplierParts,
  updateNormalizedData,
} from '../../../src/models/SupplierPart.js';
import type { SupplierPart } from '../../../src/models/SupplierPart.js';

import type { Pool } from 'pg';

interface FakeQueryResult<T = unknown> {
  rows: T[];
}

interface FakePool {
  query: (text: string, params?: unknown[]) => Promise<FakeQueryResult>;
}

interface SupplierPartRow {
  id: string;
  supplier_id: string;
  supplier_sku: string;
  raw_data: Record<string, unknown>;
  normalized_data: Record<string, unknown> | null;
  canonical_part_id: string | null;
  cost: number | null;
  availability: string | null;
  lead_time_days: number | null;
  created_at: string;
}

const makeSupplierPart = (partial: Partial<SupplierPart> = {}): SupplierPart => ({
  id: partial.id ?? randomUUID(),
  supplierId: partial.supplierId ?? 'napa',
  supplierSku: partial.supplierSku ?? 'SKU-123',
  rawData: partial.rawData ?? { sku: 'SKU-123' },
  normalizedData: partial.normalizedData ?? null,
  canonicalPartId: partial.canonicalPartId ?? null,
  cost: partial.cost ?? 1099,
  availability: partial.availability ?? 'in_stock',
  leadTimeDays: partial.leadTimeDays ?? 2,
  createdAt: partial.createdAt ?? new Date(),
});

const toRow = (sp: SupplierPart): SupplierPartRow => ({
  id: sp.id,
  supplier_id: sp.supplierId,
  supplier_sku: sp.supplierSku,
  raw_data: sp.rawData,
  normalized_data: sp.normalizedData,
  canonical_part_id: sp.canonicalPartId,
  cost: sp.cost,
  availability: sp.availability,
  lead_time_days: sp.leadTimeDays,
  created_at: sp.createdAt.toISOString(),
});

const createFakePool = (initial: SupplierPart[] = []): FakePool => {
  const store = [...initial];

  return {
    async query(text: string, params: unknown[] = []): Promise<FakeQueryResult> {
      await Promise.resolve();
      // Insert
      if (text.includes('INSERT INTO supplier_parts')) {
        const [supplierId, supplierSku, rawData, normalizedData, canonicalPartId, cost, availability, leadTime] =
          params as [
            string,
            string,
            Record<string, unknown>,
            Record<string, unknown> | null,
            string | null,
            number | null,
            string | null,
            number | null
          ];
        const duplicate = store.find((sp) => sp.supplierId === supplierId && sp.supplierSku === supplierSku);
        if (duplicate) {
          const err = new Error('duplicate') as Error & { code?: string };
          err.code = '23505';
          throw err;
        }
        const sp = makeSupplierPart({
          id: randomUUID(),
          supplierId,
          supplierSku,
          rawData,
          normalizedData,
          canonicalPartId,
          cost,
          availability,
          leadTimeDays: leadTime,
        });
        store.push(sp);
        return { rows: [toRow(sp)] };
      }

      // Get by id
      if (text.includes('FROM supplier_parts') && text.includes('WHERE id = $1')) {
        const found = store.find((sp) => sp.id === params[0]);
        return { rows: found ? [toRow(found)] : [] };
      }

      // Update normalized
      if (text.includes('SET normalized_data = $1')) {
        const normalized = params[0] as Record<string, unknown> | null;
        const id = params[1] as string;
        const index = store.findIndex((sp) => sp.id === id);
        if (index === -1) return { rows: [] };
        store[index] = { ...store[index], normalizedData: normalized ?? null };
        return { rows: [toRow(store[index])] };
      }

      // Attach canonical
      if (text.includes('SET canonical_part_id = $1')) {
        const canonicalPartId = params[0] as string | null;
        const id = params[1] as string;
        const index = store.findIndex((sp) => sp.id === id);
        if (index === -1) return { rows: [] };
        store[index] = { ...store[index], canonicalPartId: canonicalPartId ?? null };
        return { rows: [toRow(store[index])] };
      }

      // List unmapped
      if (text.includes('WHERE canonical_part_id IS NULL')) {
        const limit = params[0] as number;
        const filtered = store.filter((sp) => !sp.canonicalPartId);
        return { rows: filtered.slice(0, limit).map(toRow) };
      }

      // List by canonical
      if (text.includes('WHERE canonical_part_id = $1')) {
        const canonicalPartId = params[0] as string;
        const filtered = store.filter((sp) => sp.canonicalPartId === canonicalPartId);
        return { rows: filtered.map(toRow) };
      }

      return { rows: [] };
    },
  };
};

describe('SupplierPart model', () => {
  it('creates supplier part and enforces uniqueness', async () => {
    const pool = createFakePool([
      makeSupplierPart({ supplierId: 'napa', supplierSku: 'SKU-1' }),
    ]) as unknown as Pool;

    await expect(
      createSupplierPart({ supplierId: 'napa', supplierSku: 'SKU-1', rawData: { sku: 'SKU-1' } }, pool)
    ).rejects.toBeInstanceOf(SupplierPartUniqueConstraintError);

    const created = await createSupplierPart(
      { supplierId: 'napa', supplierSku: 'SKU-2', rawData: { sku: 'SKU-2' } },
      pool
    );
    expect(created.id).toBeDefined();
    expect(created.normalizedData).toBeNull();
  });

  it('updates normalized data and links canonical part', async () => {
    const sp = makeSupplierPart();
    const pool = createFakePool([sp]) as unknown as Pool;

    const updated = await updateNormalizedData(sp.id, { position: 'front' }, pool);
    expect(updated?.normalizedData).toEqual({ position: 'front' });

    const linked = await attachCanonicalPart(sp.id, 'part-123', pool);
    expect(linked?.canonicalPartId).toBe('part-123');
  });

  it('lists unmapped supplier parts and by canonical id', async () => {
    const s1 = makeSupplierPart({ canonicalPartId: null });
    const s2 = makeSupplierPart({ canonicalPartId: 'part-1' });
    const s3 = makeSupplierPart({ canonicalPartId: null });
    const pool = createFakePool([s1, s2, s3]) as unknown as Pool;

    const unmapped = await listUnmappedSupplierParts(10, pool);
    expect(unmapped.map((s) => s.id)).toEqual([s1.id, s3.id]);

    const linked = await listSupplierPartsByCanonicalId('part-1', pool);
    expect(linked).toHaveLength(1);
    expect(linked[0].id).toBe(s2.id);
  });

  it('fetches by id', async () => {
    const sp = makeSupplierPart();
    const pool = createFakePool([sp]) as unknown as Pool;

    const fetched = await getSupplierPartById(sp.id, pool);
    expect(fetched?.supplierSku).toBe(sp.supplierSku);
  });
});
