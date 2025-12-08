/* eslint-disable import/order */
import { randomUUID } from 'node:crypto';

import {
  VehicleUniqueConstraintError,
  createVehicle,
  findOrCreateByKey,
  findVehicleById,
  findVehicleByKey,
  listVehicles,
  searchVehicles,
} from '../../../src/models/Vehicle.js';
import type { Vehicle } from '../../../src/models/Vehicle.js';

import type { Pool } from 'pg';
import { describe, expect, it } from 'vitest';

interface FakeQueryResult {
  rows: VehicleRow[];
}

interface FakePool {
  query: (text: string, params?: unknown[]) => Promise<FakeQueryResult>;
}

interface VehicleRow {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  engine: string;
  created_at: string;
}

const titleCase = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const makeVehicle = (partial: Partial<Vehicle> = {}): Vehicle => {
  const trimValue = partial.trim === undefined ? 'Ex' : partial.trim;

  return {
    id: partial.id ?? randomUUID(),
    year: partial.year ?? 2020,
    make: titleCase(partial.make ?? 'Honda'),
    model: titleCase(partial.model ?? 'Civic'),
    trim: trimValue ? titleCase(trimValue) : null,
    engine: (partial.engine ?? '2.0L I4').trim(),
    createdAt: partial.createdAt ?? new Date(),
  };
};

const createFakePool = (initial: Vehicle[] = []): FakePool => {
  const store = initial.map((v) => ({
    ...v,
    make: titleCase(v.make),
    model: titleCase(v.model),
    trim: v.trim ? titleCase(v.trim) : null,
    engine: v.engine.trim(),
  }));

  type VehicleKeyParams = [number, string, string, string | null, string];

  const uniqueKeyMatch = (vehicle: Vehicle, params: VehicleKeyParams): boolean =>
    vehicle.year === params[0] &&
    vehicle.make === params[1] &&
    vehicle.model === params[2] &&
    ((vehicle.trim === null && params[3] === null) || vehicle.trim === params[3]) &&
    vehicle.engine === params[4];

  return {
    query(text: string, params: unknown[] = []): Promise<FakeQueryResult> {
      const extractParam = <T>(pattern: RegExp): T | undefined => {
        const match = text.match(pattern);
        if (!match) return undefined;
        const index = Number(match[1]) - 1;
        return params[index] as T;
      };

      if (text.includes('INSERT INTO vehicles')) {
        const tuple = params as VehicleKeyParams;
        const duplicate = store.find((v) => uniqueKeyMatch(v, tuple));
        if (duplicate) {
          const error = new Error('duplicate key') as Error & { code?: string };
          error.code = '23505';
          throw error;
        }
        const vehicle = makeVehicle({
          id: randomUUID(),
          year: tuple[0],
          make: tuple[1],
          model: tuple[2],
          trim: tuple[3],
          engine: tuple[4],
        });
        store.push(vehicle);
        return Promise.resolve({ rows: [vehicleToRow(vehicle)] });
      }

      if (text.includes('WHERE id = $1')) {
        const found = store.find((v) => v.id === params[0]);
        return Promise.resolve({ rows: found ? [vehicleToRow(found)] : [] });
      }

      if (
        text.includes('WHERE year = $1 AND make = $2') &&
        text.includes('trim IS NOT DISTINCT FROM $4')
      ) {
        const tuple = params as VehicleKeyParams;
        const found = store.find((v) => uniqueKeyMatch(v, tuple));
        return Promise.resolve({ rows: found ? [vehicleToRow(found)] : [] });
      }

      if (text.includes('FROM vehicles')) {
        // listVehicles or searchVehicles
        if (text.includes('WHERE make ILIKE')) {
          const term = (params[0] as string).replace(/%/g, '').toLowerCase();
          const limit = params[1] as number;
          const filtered = store
            .filter(
              (v) =>
                v.make.toLowerCase().includes(term) ||
                v.model.toLowerCase().includes(term) ||
                (v.trim ?? '').toLowerCase().includes(term)
            )
            .slice(0, limit);
          return Promise.resolve({ rows: filtered.map(vehicleToRow) });
        }

        const limit = params[params.length - 2] as number;
        const offset = params[params.length - 1] as number;
        const listLimit = extractParam<number>(/LIMIT \$(\d+)/) ?? limit;
        const listOffset = extractParam<number>(/OFFSET \$(\d+)/) ?? offset;
        let filtered = [...store];

        const yearParam = extractParam<number>(/year = \$(\d+)/);
        if (yearParam !== undefined) {
          filtered = filtered.filter((v) => v.year === yearParam);
        }

        const makeParam = extractParam<string>(/make = \$(\d+)/);
        if (makeParam !== undefined) {
          filtered = filtered.filter((v) => v.make === makeParam);
        }

        const modelParam = extractParam<string>(/model = \$(\d+)/);
        if (modelParam !== undefined) {
          filtered = filtered.filter((v) => v.model === modelParam);
        }

        const ordered = filtered.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          if (a.make !== b.make) return a.make.localeCompare(b.make);
          return a.model.localeCompare(b.model);
        });
        return Promise.resolve({
          rows: ordered.slice(listOffset, listOffset + listLimit).map(vehicleToRow),
        });
      }

      return Promise.resolve({ rows: [] });
    },
  };
};

const vehicleToRow = (vehicle: Vehicle): VehicleRow => ({
  id: vehicle.id,
  year: vehicle.year,
  make: vehicle.make,
  model: vehicle.model,
  trim: vehicle.trim,
  engine: vehicle.engine,
  created_at: vehicle.createdAt.toISOString(),
});

describe('Vehicle model', () => {
  it('creates a vehicle and normalizes fields', async () => {
    const pool = createFakePool() as unknown as Pool;
    const vehicle = await createVehicle(
      { year: 2021, make: 'HONDA', model: 'civic', trim: 'ex', engine: '2.0L I4' },
      pool
    );

    expect(vehicle.make).toBe('Honda');
    expect(vehicle.model).toBe('Civic');
    expect(vehicle.trim).toBe('Ex');
    expect(vehicle.year).toBe(2021);
  });

  it('enforces uniqueness on YMMTE', async () => {
    const pool = createFakePool([
      makeVehicle({ year: 2020, make: 'Honda', model: 'Civic', trim: 'EX', engine: '2.0L I4' }),
    ]) as unknown as Pool;

    await expect(
      createVehicle(
        { year: 2020, make: 'Honda', model: 'Civic', trim: 'EX', engine: '2.0L I4' },
        pool
      )
    ).rejects.toBeInstanceOf(VehicleUniqueConstraintError);
  });

  it('treats null trim as part of the uniqueness constraint', async () => {
    const pool = createFakePool([
      makeVehicle({ year: 2020, make: 'Honda', model: 'Civic', trim: null, engine: '2.0L I4' }),
    ]) as unknown as Pool;

    const existing = await findVehicleByKey(
      { year: 2020, make: 'Honda', model: 'Civic', trim: null, engine: '2.0L I4' },
      pool
    );
    expect(existing?.trim).toBeNull();

    await expect(
      createVehicle(
        { year: 2020, make: 'Honda', model: 'Civic', trim: null, engine: '2.0L I4' },
        pool
      )
    ).rejects.toBeInstanceOf(VehicleUniqueConstraintError);
  });

  it('finds by id and by key', async () => {
    const existing = makeVehicle({
      year: 2019,
      make: 'Toyota',
      model: 'Camry',
      trim: 'LE',
      engine: '2.5L I4',
    });
    const pool = createFakePool([existing]) as unknown as Pool;

    const byId = await findVehicleById(existing.id, pool);
    const byKey = await findVehicleByKey(
      { year: existing.year, make: 'toyota', model: 'camry', trim: 'le', engine: existing.engine },
      pool
    );

    expect(byId?.id).toBe(existing.id);
    expect(byKey?.id).toBe(existing.id);
  });

  it('findOrCreate handles concurrency-safe duplicate insert', async () => {
    const pool = createFakePool() as unknown as Pool;

    const [first, second] = await Promise.all([
      findOrCreateByKey(
        { year: 2022, make: 'Ford', model: 'F-150', trim: 'XL', engine: '3.3L V6' },
        pool
      ),
      findOrCreateByKey(
        { year: 2022, make: 'Ford', model: 'F-150', trim: 'XL', engine: '3.3L V6' },
        pool
      ),
    ]);

    expect(first.vehicle.id).toBe(second.vehicle.id);
    expect(first.created !== second.created).toBe(true);
  });

  it('lists vehicles with filters and ordering', async () => {
    const pool = createFakePool([
      makeVehicle({ year: 2020, make: 'Honda', model: 'Civic' }),
      makeVehicle({ year: 2021, make: 'Honda', model: 'Accord' }),
      makeVehicle({ year: 2019, make: 'Toyota', model: 'Camry' }),
    ]) as unknown as Pool;

    const list = await listVehicles({ make: 'honda' }, pool);
    expect(list).toHaveLength(2);
    expect(list[0].year).toBe(2021);
  });

  it('searches vehicles by text', async () => {
    const pool = createFakePool([
      makeVehicle({ year: 2020, make: 'Honda', model: 'Civic' }),
      makeVehicle({ year: 2021, make: 'Honda', model: 'Accord' }),
      makeVehicle({ year: 2019, make: 'Toyota', model: 'Camry' }),
    ]) as unknown as Pool;

    const results = await searchVehicles('cam', 5, pool);
    expect(results).toHaveLength(1);
    expect(results[0].model).toBe('Camry');
  });
});
