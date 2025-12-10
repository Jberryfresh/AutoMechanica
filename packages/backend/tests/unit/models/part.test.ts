/* eslint-disable import/order */
import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { createPart, listPartsByCategory, searchParts, updatePart } from '../../../src/models/Part.js';
import type { Part } from '../../../src/models/Part.js';

import type { Pool } from 'pg';

interface FakeQueryResult<T = unknown> {
  rows: T[];
}

interface FakePool {
  query: (text: string, params?: unknown[]) => Promise<FakeQueryResult>;
}

interface PartRow {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  description: string | null;
  attributes: Record<string, unknown>;
  created_at: string;
}

const makePart = (partial: Partial<Part> = {}): Part => ({
  id: partial.id ?? randomUUID(),
  name: partial.name ?? 'Front Brake Rotor',
  category: partial.category ?? 'brakes',
  brand: partial.brand ?? 'ACME',
  description: partial.description ?? 'High quality rotor',
  attributes: partial.attributes ?? { position: 'front' },
  createdAt: partial.createdAt ?? new Date(),
});

const partToRow = (part: Part): PartRow => ({
  id: part.id,
  name: part.name,
  category: part.category,
  brand: part.brand,
  description: part.description,
  attributes: part.attributes,
  created_at: part.createdAt.toISOString(),
});

const createFakePool = (initial: Part[] = [], fitmentIndex: Record<string, string[]> = {}): FakePool => {
  const parts = [...initial];

  return {
    async query(text: string, params: unknown[] = []): Promise<FakeQueryResult> {
      await Promise.resolve();
      // Create
      if (text.includes('INSERT INTO parts')) {
        const [name, category, brand, description, attributes] = params as [
          string,
          string,
          string | null,
          string | null,
          Record<string, unknown>
        ];
        const part = makePart({
          id: randomUUID(),
          name,
          category,
          brand,
          description,
          attributes,
        });
        parts.push(part);
        return { rows: [partToRow(part)] };
      }

      // Get by id
      if (text.includes('WHERE id = $1') && text.includes('FROM parts')) {
        const found = parts.find((p) => p.id === params[0]);
        return { rows: found ? [partToRow(found)] : [] };
      }

      // Update
      if (text.includes('UPDATE parts')) {
        const [name, category, brand, description, attributes, id] = params as [
          string,
          string,
          string | null,
          string | null,
          Record<string, unknown>,
          string
        ];
        const index = parts.findIndex((p) => p.id === id);
        if (index === -1) return { rows: [] };
        const updated = makePart({
          ...parts[index],
          name,
          category,
          brand,
          description,
          attributes,
        });
        parts[index] = updated;
        return { rows: [partToRow(updated)] };
      }

      // Search with vehicle join
      if (text.includes('FROM parts p') && text.includes('INNER JOIN fitments')) {
        const term = (params[0] as string).replace(/%/g, '').toLowerCase();
        const vehicleId = params[1] as string;
        const limit = params[2] as number;
        const matched = parts.filter(
          (p) =>
            (p.name.toLowerCase().includes(term) || (p.brand ?? '').toLowerCase().includes(term)) &&
            (fitmentIndex[vehicleId] ?? []).includes(p.id)
        );
        return { rows: matched.slice(0, limit).map(partToRow) };
      }

      // Search without vehicle
      if (text.includes('WHERE name ILIKE $1 OR brand ILIKE $1')) {
        const term = (params[0] as string).replace(/%/g, '').toLowerCase();
        const limit = params[1] as number;
        const matched = parts.filter(
          (p) => p.name.toLowerCase().includes(term) || (p.brand ?? '').toLowerCase().includes(term)
        );
        return { rows: matched.slice(0, limit).map(partToRow) };
      }

      // List
      if (text.includes('FROM parts')) {
        const limit = params[params.length - 2] as number;
        const offset = params[params.length - 1] as number;
        let filtered = [...parts];
        if (text.includes('category = $1')) {
          const category = params[0] as string;
          filtered = filtered.filter((p) => p.category === category);
        }
        const ordered = filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return { rows: ordered.slice(offset, offset + limit).map(partToRow) };
      }

      return { rows: [] };
    },
  };
};

describe('Part model', () => {
  it('creates and normalizes a part', async () => {
    const pool = createFakePool() as unknown as Pool;
    const part = await createPart(
      {
        name: 'front brake rotor',
        category: 'Brakes',
        brand: 'acme',
        description: '  smooth braking ',
        attributes: { position: 'front' },
      },
      pool
    );

    expect(part.name).toBe('Front Brake Rotor');
    expect(part.category).toBe('brakes');
    expect(part.brand).toBe('Acme');
    expect(part.description).toBe('smooth braking');
  });

  it('updates a part description and attributes', async () => {
    const existing = makePart({ description: 'old desc', attributes: { position: 'front' } });
    const pool = createFakePool([existing]) as unknown as Pool;

    const updated = await updatePart(
      existing.id,
      { description: 'new desc', attributes: { position: 'front', material: 'steel' } },
      pool
    );

    expect(updated.description).toBe('new desc');
    expect(updated.attributes).toEqual({ position: 'front', material: 'steel' });
  });

  it('lists parts by category with pagination', async () => {
    const pool = createFakePool([
      makePart({ category: 'brakes', name: 'Rotor A', createdAt: new Date('2024-01-02') }),
      makePart({ category: 'brakes', name: 'Pad B', createdAt: new Date('2024-01-03') }),
      makePart({ category: 'engine', name: 'Filter', createdAt: new Date('2024-01-01') }),
    ]) as unknown as Pool;

    const parts = await listPartsByCategory({ category: 'brakes', limit: 1 }, pool);
    expect(parts).toHaveLength(1);
    expect(parts[0].name).toBe('Pad B');
  });

  it('searches parts by name/brand and vehicle fitment', async () => {
    const brake = makePart({ name: 'Rotor Premium', brand: 'Brembo' });
    const pads = makePart({ name: 'Ceramic Pads', brand: 'Acme' });
    const pool = createFakePool([brake, pads], { vehicle1: [brake.id] }) as unknown as Pool;

    const textResults = await searchParts('brem', undefined, 5, pool);
    expect(textResults).toHaveLength(1);
    expect(textResults[0].id).toBe(brake.id);

    const vehicleResults = await searchParts('rotor', 'vehicle1', 5, pool);
    expect(vehicleResults).toHaveLength(1);
    expect(vehicleResults[0].id).toBe(brake.id);
  });
});
