import { getPool } from '../db/client.js';

import type { Pool } from 'pg';

export interface OrderLine {
  id: string;
  orderId: string;
  canonicalPartId: string;
  quantity: number;
  finalPrice: number;
  fitmentConfidence: number | null;
  createdAt: Date;
}

export interface OrderLineInput {
  canonicalPartId: string;
  quantity: number;
  finalPrice: number;
  fitmentConfidence?: number | null;
}

export class OrderLineValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderLineValidationError';
  }
}

export const validateOrderLineInput = (input: OrderLineInput): void => {
  if (!input.canonicalPartId?.trim())
    throw new OrderLineValidationError('canonicalPartId is required');
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new OrderLineValidationError('quantity must be a positive integer');
  }
  if (
    typeof input.finalPrice !== 'number' ||
    Number.isNaN(input.finalPrice) ||
    input.finalPrice < 0
  ) {
    throw new OrderLineValidationError('finalPrice must be a non-negative number');
  }
  if (
    input.fitmentConfidence !== undefined &&
    input.fitmentConfidence !== null &&
    (input.fitmentConfidence < 0 || input.fitmentConfidence > 1)
  ) {
    throw new OrderLineValidationError('fitmentConfidence must be between 0 and 1 when provided');
  }
};

interface OrderLineRow {
  id: string;
  order_id: string;
  canonical_part_id: string;
  quantity: number;
  final_price: string;
  fitment_confidence: number | null;
  created_at: string | Date;
}

const mapOrderLineRow = (row: OrderLineRow): OrderLine => ({
  id: row.id,
  orderId: row.order_id,
  canonicalPartId: row.canonical_part_id,
  quantity: row.quantity,
  finalPrice: Number(row.final_price),
  fitmentConfidence: row.fitment_confidence ?? null,
  createdAt: new Date(row.created_at),
});

export const createOrderLine = async (
  orderId: string,
  input: OrderLineInput,
  pool: Pool = getPool()
): Promise<OrderLine> => {
  validateOrderLineInput(input);

  const result = await pool.query<OrderLineRow>(
    `
      INSERT INTO order_lines (order_id, canonical_part_id, quantity, final_price, fitment_confidence)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, order_id, canonical_part_id, quantity, final_price, fitment_confidence, created_at
    `,
    [
      orderId,
      input.canonicalPartId,
      input.quantity,
      input.finalPrice,
      input.fitmentConfidence ?? null,
    ]
  );

  return mapOrderLineRow(result.rows[0]);
};

export const listOrderLines = async (
  orderId: string,
  pool: Pool = getPool()
): Promise<OrderLine[]> => {
  const result = await pool.query<OrderLineRow>(
    `
      SELECT id, order_id, canonical_part_id, quantity, final_price, fitment_confidence, created_at
      FROM order_lines
      WHERE order_id = $1
      ORDER BY created_at ASC
    `,
    [orderId]
  );
  return result.rows.map(mapOrderLineRow);
};
