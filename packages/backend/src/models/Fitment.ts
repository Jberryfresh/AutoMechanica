import { getPool } from '../db/client.js';

import type { Pool } from 'pg';

export interface Fitment {
  id: string;
  canonicalPartId: string;
  vehicleId: string;
  confidence: number;
  evidence: Record<string, unknown> | null;
  source: string | null;
  createdAt: Date;
}

export interface FitmentInput {
  canonicalPartId: string;
  vehicleId: string;
  confidence: number;
  evidence?: Record<string, unknown> | null;
  source?: string | null;
}

export class FitmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FitmentValidationError';
  }
}

export class FitmentUniqueConstraintError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FitmentUniqueConstraintError';
  }
}

const validateFitmentInput = (input: FitmentInput): void => {
  if (!input.canonicalPartId?.trim()) throw new FitmentValidationError('canonicalPartId is required');
  if (!input.vehicleId?.trim()) throw new FitmentValidationError('vehicleId is required');
  if (typeof input.confidence !== 'number' || Number.isNaN(input.confidence)) {
    throw new FitmentValidationError('confidence must be a number');
  }
  if (input.confidence < 0 || input.confidence > 1) {
    throw new FitmentValidationError('confidence must be between 0 and 1');
  }
};

interface FitmentRow {
  id: string;
  canonical_part_id: string;
  vehicle_id: string;
  confidence: number;
  evidence: Record<string, unknown> | null;
  source: string | null;
  created_at: string | Date;
}

const mapFitmentRow = (row: FitmentRow): Fitment => ({
  id: row.id,
  canonicalPartId: row.canonical_part_id,
  vehicleId: row.vehicle_id,
  confidence: row.confidence,
  evidence: row.evidence ?? null,
  source: row.source ?? null,
  createdAt: new Date(row.created_at),
});

/** Create a fitment link with confidence and optional evidence. */
export const createFitment = async (input: FitmentInput, pool: Pool = getPool()): Promise<Fitment> => {
  validateFitmentInput(input);

  try {
    const result = await pool.query<FitmentRow>(
      `
        INSERT INTO fitments (canonical_part_id, vehicle_id, confidence, evidence, source)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, canonical_part_id, vehicle_id, confidence, evidence, source, created_at
      `,
      [input.canonicalPartId, input.vehicleId, input.confidence, input.evidence ?? null, input.source ?? null]
    );
    return mapFitmentRow(result.rows[0]);
  } catch (error: unknown) {
    const pgError = error as { code?: string };
    if (pgError?.code === '23505') {
      throw new FitmentUniqueConstraintError('Fitment already exists for part + vehicle');
    }
    throw error;
  }
};

export const updateFitment = async (
  id: string,
  updates: Partial<Pick<FitmentInput, 'confidence' | 'evidence' | 'source'>>,
  pool: Pool = getPool()
): Promise<Fitment | null> => {
  if (updates.confidence !== undefined) {
    validateFitmentInput({
      canonicalPartId: 'placeholder',
      vehicleId: 'placeholder',
      confidence: updates.confidence,
    });
  }

  const result = await pool.query<FitmentRow>(
    `
      UPDATE fitments
      SET confidence = COALESCE($1, confidence),
          evidence = COALESCE($2, evidence),
          source = COALESCE($3, source)
      WHERE id = $4
      RETURNING id, canonical_part_id, vehicle_id, confidence, evidence, source, created_at
    `,
    [updates.confidence ?? null, updates.evidence ?? null, updates.source ?? null, id]
  );
  return result.rows[0] ? mapFitmentRow(result.rows[0]) : null;
};

export const listFitmentsForPart = async (
  partId: string,
  minConfidence = 0,
  pool: Pool = getPool()
): Promise<Fitment[]> => {
  const result = await pool.query<FitmentRow>(
    `
      SELECT id, canonical_part_id, vehicle_id, confidence, evidence, source, created_at
      FROM fitments
      WHERE canonical_part_id = $1 AND confidence >= $2
      ORDER BY confidence DESC, created_at DESC
    `,
    [partId, minConfidence]
  );
  return result.rows.map(mapFitmentRow);
};

export const listFitmentsForVehicle = async (
  vehicleId: string,
  minConfidence = 0,
  pool: Pool = getPool()
): Promise<Fitment[]> => {
  const result = await pool.query<FitmentRow>(
    `
      SELECT id, canonical_part_id, vehicle_id, confidence, evidence, source, created_at
      FROM fitments
      WHERE vehicle_id = $1 AND confidence >= $2
      ORDER BY confidence DESC, created_at DESC
    `,
    [vehicleId, minConfidence]
  );
  return result.rows.map(mapFitmentRow);
};

export const getFitmentForPartAndVehicle = async (
  partId: string,
  vehicleId: string,
  pool: Pool = getPool()
): Promise<Fitment | null> => {
  const result = await pool.query<FitmentRow>(
    `
      SELECT id, canonical_part_id, vehicle_id, confidence, evidence, source, created_at
      FROM fitments
      WHERE canonical_part_id = $1 AND vehicle_id = $2
    `,
    [partId, vehicleId]
  );
  return result.rows[0] ? mapFitmentRow(result.rows[0]) : null;
};

export const deleteFitment = async (id: string, pool: Pool = getPool()): Promise<void> => {
  await pool.query('DELETE FROM fitments WHERE id = $1', [id]);
};
