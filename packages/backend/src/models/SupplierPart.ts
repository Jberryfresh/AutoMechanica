import { getPool } from '../db/client.js';

import type { Pool } from 'pg';

export interface SupplierPart {
  id: string;
  supplierId: string;
  supplierSku: string;
  rawData: Record<string, unknown>;
  normalizedData: Record<string, unknown> | null;
  canonicalPartId: string | null;
  cost: number | null;
  availability: string | null;
  leadTimeDays: number | null;
  createdAt: Date;
}

export interface SupplierPartInput {
  supplierId: string;
  supplierSku: string;
  rawData: Record<string, unknown>;
  normalizedData?: Record<string, unknown> | null;
  canonicalPartId?: string | null;
  cost?: number | null;
  availability?: string | null;
  leadTimeDays?: number | null;
}

export class SupplierPartValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupplierPartValidationError';
  }
}

export class SupplierPartUniqueConstraintError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupplierPartUniqueConstraintError';
  }
}

const validateSupplierPartInput = (input: SupplierPartInput): void => {
  if (!input.supplierId?.trim()) throw new SupplierPartValidationError('supplierId is required');
  if (!input.supplierSku?.trim()) throw new SupplierPartValidationError('supplierSku is required');
  if (input.rawData === undefined) throw new SupplierPartValidationError('rawData is required');
  if (input.cost !== undefined && input.cost !== null && typeof input.cost !== 'number') {
    throw new SupplierPartValidationError('cost must be a number when provided');
  }
  if (input.leadTimeDays !== undefined && input.leadTimeDays !== null && !Number.isInteger(input.leadTimeDays)) {
    throw new SupplierPartValidationError('leadTimeDays must be an integer when provided');
  }
};

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
  created_at: string | Date;
}

const mapSupplierPartRow = (row: SupplierPartRow): SupplierPart => ({
  id: row.id,
  supplierId: row.supplier_id,
  supplierSku: row.supplier_sku,
  rawData: row.raw_data,
  normalizedData: row.normalized_data ?? null,
  canonicalPartId: row.canonical_part_id ?? null,
  cost: row.cost ?? null,
  availability: row.availability ?? null,
  leadTimeDays: row.lead_time_days ?? null,
  createdAt: new Date(row.created_at),
});

/** Insert a supplier part; enforces unique supplier_id + supplier_sku. */
export const createSupplierPart = async (
  input: SupplierPartInput,
  pool: Pool = getPool()
): Promise<SupplierPart> => {
  validateSupplierPartInput(input);

  try {
    const result = await pool.query<SupplierPartRow>(
      `
        INSERT INTO supplier_parts (
          supplier_id,
          supplier_sku,
          raw_data,
          normalized_data,
          canonical_part_id,
          cost,
          availability,
          lead_time_days
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, supplier_id, supplier_sku, raw_data, normalized_data, canonical_part_id, cost, availability, lead_time_days, created_at
      `,
      [
        input.supplierId.trim(),
        input.supplierSku.trim(),
        input.rawData,
        input.normalizedData ?? null,
        input.canonicalPartId ?? null,
        input.cost ?? null,
        input.availability ?? null,
        input.leadTimeDays ?? null,
      ]
    );
    return mapSupplierPartRow(result.rows[0]);
  } catch (error: unknown) {
    const pgError = error as { code?: string };
    if (pgError?.code === '23505') {
      throw new SupplierPartUniqueConstraintError('Duplicate supplier_id + supplier_sku');
    }
    throw error;
  }
};

export const getSupplierPartById = async (
  id: string,
  pool: Pool = getPool()
): Promise<SupplierPart | null> => {
  const result = await pool.query<SupplierPartRow>(
    `
      SELECT id, supplier_id, supplier_sku, raw_data, normalized_data, canonical_part_id, cost, availability, lead_time_days, created_at
      FROM supplier_parts
      WHERE id = $1
    `,
    [id]
  );
  return result.rows[0] ? mapSupplierPartRow(result.rows[0]) : null;
};

export const updateNormalizedData = async (
  id: string,
  normalizedData: Record<string, unknown> | null,
  pool: Pool = getPool()
): Promise<SupplierPart | null> => {
  const result = await pool.query<SupplierPartRow>(
    `
      UPDATE supplier_parts
      SET normalized_data = $1
      WHERE id = $2
      RETURNING id, supplier_id, supplier_sku, raw_data, normalized_data, canonical_part_id, cost, availability, lead_time_days, created_at
    `,
    [normalizedData ?? null, id]
  );
  return result.rows[0] ? mapSupplierPartRow(result.rows[0]) : null;
};

export const attachCanonicalPart = async (
  supplierPartId: string,
  canonicalPartId: string | null,
  pool: Pool = getPool()
): Promise<SupplierPart | null> => {
  const result = await pool.query<SupplierPartRow>(
    `
      UPDATE supplier_parts
      SET canonical_part_id = $1
      WHERE id = $2
      RETURNING id, supplier_id, supplier_sku, raw_data, normalized_data, canonical_part_id, cost, availability, lead_time_days, created_at
    `,
    [canonicalPartId ?? null, supplierPartId]
  );
  return result.rows[0] ? mapSupplierPartRow(result.rows[0]) : null;
};

export const listUnmappedSupplierParts = async (
  limit = 50,
  pool: Pool = getPool()
): Promise<SupplierPart[]> => {
  const normalizedLimit = limit > 0 ? Math.min(limit, 100) : 50;
  const result = await pool.query<SupplierPartRow>(
    `
      SELECT id, supplier_id, supplier_sku, raw_data, normalized_data, canonical_part_id, cost, availability, lead_time_days, created_at
      FROM supplier_parts
      WHERE canonical_part_id IS NULL
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [normalizedLimit]
  );
  return result.rows.map(mapSupplierPartRow);
};

export const listSupplierPartsByCanonicalId = async (
  canonicalPartId: string,
  pool: Pool = getPool()
): Promise<SupplierPart[]> => {
  const result = await pool.query<SupplierPartRow>(
    `
      SELECT id, supplier_id, supplier_sku, raw_data, normalized_data, canonical_part_id, cost, availability, lead_time_days, created_at
      FROM supplier_parts
      WHERE canonical_part_id = $1
      ORDER BY created_at DESC
    `,
    [canonicalPartId]
  );
  return result.rows.map(mapSupplierPartRow);
};
