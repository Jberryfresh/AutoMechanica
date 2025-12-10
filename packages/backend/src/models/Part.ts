import { getPool } from '../db/client.js';

import type { Pool } from 'pg';

export interface Part {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  description: string | null;
  attributes: Record<string, unknown>;
  createdAt: Date;
}

export interface PartInput {
  name: string;
  category: string;
  brand?: string | null;
  description?: string | null;
  attributes?: Record<string, unknown>;
}

export class PartValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PartValidationError';
  }
}

export class PartNotFoundError extends Error {
  constructor(id: string) {
    super(`Part ${id} not found`);
    this.name = 'PartNotFoundError';
  }
}

const titleCase = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizePartInput = (input: PartInput): PartInput => ({
  name: titleCase(input.name),
  category: input.category.trim().toLowerCase(),
  brand: input.brand ? titleCase(input.brand) : null,
  description: input.description?.trim() ?? null,
  attributes: input.attributes ?? {},
});

const validateAttributes = (attributes: Record<string, unknown> | undefined): void => {
  if (!attributes) return;
  if (typeof attributes !== 'object' || Array.isArray(attributes)) {
    throw new PartValidationError('attributes must be an object');
  }
};

const validatePartInput = (input: PartInput): void => {
  if (!input.name?.trim()) throw new PartValidationError('name is required');
  if (!input.category?.trim()) throw new PartValidationError('category is required');
  validateAttributes(input.attributes);
};

interface PartRow {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  description: string | null;
  attributes: Record<string, unknown>;
  created_at: string | Date;
}

const mapPartRow = (row: PartRow): Part => ({
  id: row.id,
  name: row.name,
  category: row.category,
  brand: row.brand,
  description: row.description,
  attributes: row.attributes ?? {},
  createdAt: new Date(row.created_at),
});

/** Insert a new canonical part with normalized fields. */
export const createPart = async (input: PartInput, pool: Pool = getPool()): Promise<Part> => {
  validatePartInput(input);
  const normalized = normalizePartInput(input);

  const result = await pool.query<PartRow>(
    `
      INSERT INTO parts (name, category, brand, description, attributes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, category, brand, description, attributes, created_at
    `,
    [normalized.name, normalized.category, normalized.brand, normalized.description, normalized.attributes]
  );
  return mapPartRow(result.rows[0]);
};

/** Retrieve a part by its UUID. */
export const getPartById = async (id: string, pool: Pool = getPool()): Promise<Part | null> => {
  const result = await pool.query<PartRow>(
    'SELECT id, name, category, brand, description, attributes, created_at FROM parts WHERE id = $1',
    [id]
  );
  return result.rows[0] ? mapPartRow(result.rows[0]) : null;
};

/** Update a part by replacing provided fields and returning the new row. Throws if not found. */
export const updatePart = async (
  id: string,
  updates: Partial<PartInput>,
  pool: Pool = getPool()
): Promise<Part> => {
  const existing = await getPartById(id, pool);
  if (!existing) throw new PartNotFoundError(id);

  const merged: PartInput = {
    name: updates.name ?? existing.name,
    category: updates.category ?? existing.category,
    brand: updates.brand ?? existing.brand,
    description: updates.description ?? existing.description,
    attributes: updates.attributes ?? existing.attributes,
  };

  validatePartInput(merged);
  const normalized = normalizePartInput(merged);

  const result = await pool.query<PartRow>(
    `
      UPDATE parts
      SET name = $1, category = $2, brand = $3, description = $4, attributes = $5
      WHERE id = $6
      RETURNING id, name, category, brand, description, attributes, created_at
    `,
    [normalized.name, normalized.category, normalized.brand, normalized.description, normalized.attributes, id]
  );

  return mapPartRow(result.rows[0]);
};

interface PartListFilters {
  category?: string;
  limit?: number;
  offset?: number;
}

/** List parts filtered by category (optional) with pagination. */
export const listPartsByCategory = async (
  filters: PartListFilters = {},
  pool: Pool = getPool()
): Promise<Part[]> => {
  const limit = filters.limit && filters.limit > 0 ? Math.min(filters.limit, 100) : 50;
  const offset = filters.offset && filters.offset > 0 ? filters.offset : 0;

  const params: Array<string | number> = [];
  const where: string[] = [];

  if (filters.category) {
    params.push(filters.category.trim().toLowerCase());
    where.push(`category = $${params.length}`);
  }

  params.push(limit, offset);

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const result = await pool.query<PartRow>(
    `
      SELECT id, name, category, brand, description, attributes, created_at
      FROM parts
      ${whereClause}
      ORDER BY created_at DESC, name ASC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `,
    params
  );

  return result.rows.map(mapPartRow);
};

/** Search parts by name or brand, optionally filtering by vehicle fitment. */
export const searchParts = async (
  query: string,
  vehicleId?: string,
  limit = 20,
  pool: Pool = getPool()
): Promise<Part[]> => {
  const normalizedLimit = limit > 0 ? Math.min(limit, 50) : 20;
  const term = `%${query.trim()}%`;

  if (vehicleId) {
    const result = await pool.query<PartRow>(
      `
        SELECT DISTINCT p.id, p.name, p.category, p.brand, p.description, p.attributes, p.created_at
        FROM parts p
        INNER JOIN fitments f ON f.canonical_part_id = p.id
        WHERE (p.name ILIKE $1 OR p.brand ILIKE $1) AND f.vehicle_id = $2
        ORDER BY p.name ASC
        LIMIT $3
      `,
      [term, vehicleId, normalizedLimit]
    );
    return result.rows.map(mapPartRow);
  }

  const result = await pool.query<PartRow>(
    `
      SELECT id, name, category, brand, description, attributes, created_at
      FROM parts
      WHERE name ILIKE $1 OR brand ILIKE $1
      ORDER BY name ASC
      LIMIT $2
    `,
    [term, normalizedLimit]
  );
  return result.rows.map(mapPartRow);
};
