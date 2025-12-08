import { getPool } from '../db/client.js';

import type { Pool } from 'pg';

export interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  engine: string;
  createdAt: Date;
}

export interface VehicleInput {
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  engine: string;
}

export class VehicleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VehicleValidationError';
  }
}

export class VehicleUniqueConstraintError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VehicleUniqueConstraintError';
  }
}

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

const titleCase = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeInput = (input: VehicleInput): VehicleInput => ({
  year: input.year,
  make: titleCase(input.make),
  model: titleCase(input.model),
  trim: input.trim ? titleCase(input.trim) : null,
  engine: input.engine.trim(),
});

const validateInput = (input: VehicleInput): void => {
  if (!Number.isInteger(input.year) || input.year < MIN_YEAR || input.year > MAX_YEAR) {
    throw new VehicleValidationError(`year must be an integer between ${MIN_YEAR} and ${MAX_YEAR}`);
  }
  if (!input.make?.trim()) throw new VehicleValidationError('make is required');
  if (!input.model?.trim()) throw new VehicleValidationError('model is required');
  if (!input.engine?.trim()) throw new VehicleValidationError('engine is required');
};

interface VehicleRow {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  engine: string;
  created_at: string | Date;
}

const mapRow = (row: VehicleRow): Vehicle => ({
  id: row.id,
  year: row.year,
  make: row.make,
  model: row.model,
  trim: row.trim,
  engine: row.engine,
  createdAt: new Date(row.created_at),
});

export const createVehicle = async (
  input: VehicleInput,
  pool: Pool = getPool()
): Promise<Vehicle> => {
  validateInput(input);
  const normalized = normalizeInput(input);

  try {
    const result = await pool.query<VehicleRow>(
      `
        INSERT INTO vehicles (year, make, model, trim, engine)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, year, make, model, trim, engine, created_at
      `,
      [normalized.year, normalized.make, normalized.model, normalized.trim, normalized.engine]
    );
    return mapRow(result.rows[0]);
  } catch (error: unknown) {
    const pgError = error as { code?: string };
    if (pgError?.code === '23505') {
      throw new VehicleUniqueConstraintError('Vehicle already exists for the given YMMTE key');
    }
    throw error;
  }
};

export const findVehicleById = async (
  id: string,
  pool: Pool = getPool()
): Promise<Vehicle | null> => {
  const result = await pool.query<VehicleRow>(
    'SELECT id, year, make, model, trim, engine, created_at FROM vehicles WHERE id = $1',
    [id]
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
};

export const findVehicleByKey = async (
  key: VehicleInput,
  pool: Pool = getPool()
): Promise<Vehicle | null> => {
  const normalized = normalizeInput(key);
  const result = await pool.query<VehicleRow>(
    `
      SELECT id, year, make, model, trim, engine, created_at
      FROM vehicles
      WHERE year = $1 AND make = $2 AND model = $3 AND trim IS NOT DISTINCT FROM $4 AND engine = $5
    `,
    [normalized.year, normalized.make, normalized.model, normalized.trim, normalized.engine]
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
};

export const findOrCreateByKey = async (
  input: VehicleInput,
  pool: Pool = getPool()
): Promise<{ vehicle: Vehicle; created: boolean }> => {
  validateInput(input);
  const normalized = normalizeInput(input);

  const existing = await findVehicleByKey(normalized, pool);
  if (existing) return { vehicle: existing, created: false };

  try {
    const vehicle = await createVehicle(normalized, pool);
    return { vehicle, created: true };
  } catch (error: unknown) {
    const pgError = error as { code?: string };
    if (pgError?.code === '23505' || error instanceof VehicleUniqueConstraintError) {
      const vehicle = await findVehicleByKey(normalized, pool);
      if (vehicle) return { vehicle, created: false };
    }
    throw error;
  }
};

interface ListFilters {
  year?: number;
  make?: string;
  model?: string;
  limit?: number;
  offset?: number;
}

export const listVehicles = async (
  filters: ListFilters = {},
  pool: Pool = getPool()
): Promise<Vehicle[]> => {
  const limit = filters.limit && filters.limit > 0 ? Math.min(filters.limit, 100) : 50;
  const offset = filters.offset && filters.offset > 0 ? filters.offset : 0;

  const normalized = {
    make: filters.make ? titleCase(filters.make) : undefined,
    model: filters.model ? titleCase(filters.model) : undefined,
    year: filters.year,
  };

  const where: string[] = [];
  const params: Array<string | number> = [];

  if (normalized.year) {
    params.push(normalized.year);
    where.push(`year = $${params.length}`);
  }
  if (normalized.make) {
    params.push(normalized.make);
    where.push(`make = $${params.length}`);
  }
  if (normalized.model) {
    params.push(normalized.model);
    where.push(`model = $${params.length}`);
  }

  params.push(limit);
  params.push(offset);

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const query = `
    SELECT id, year, make, model, trim, engine, created_at
    FROM vehicles
    ${whereClause}
    ORDER BY year DESC, make ASC, model ASC, trim ASC NULLS LAST
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;

  const result = await pool.query(query, params);
  return result.rows.map(mapRow);
};

export const searchVehicles = async (
  query: string,
  limit = 10,
  pool: Pool = getPool()
): Promise<Vehicle[]> => {
  const normalizedLimit = limit > 0 ? Math.min(limit, 50) : 10;
  const term = `%${query.trim()}%`;

  const result = await pool.query(
    `
      SELECT id, year, make, model, trim, engine, created_at
      FROM vehicles
      WHERE make ILIKE $1 OR model ILIKE $1 OR trim ILIKE $1
      ORDER BY year DESC, make ASC, model ASC, trim ASC NULLS LAST
      LIMIT $2
    `,
    [term, normalizedLimit]
  );
  return result.rows.map(mapRow);
};
