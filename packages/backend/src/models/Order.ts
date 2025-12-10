import { getPool } from '../db/client.js';

import {
  createOrderLine,
  listOrderLines,
  validateOrderLineInput,
  type OrderLine,
  type OrderLineInput,
} from './OrderLine.js';

import type { Pool } from 'pg';

export interface Order {
  id: string;
  userId: string | null;
  status: string;
  totalAmount: number;
  shippingAddress: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  lines?: OrderLine[];
}

export interface CreateOrderInput {
  userId?: string | null;
  status?: string;
  shippingAddress?: Record<string, unknown> | null;
  lines: Array<OrderLineInput>;
}

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderValidationError';
  }
}

export class OrderNotFoundError extends Error {
  constructor(id: string) {
    super(`Order ${id} not found`);
    this.name = 'OrderNotFoundError';
  }
}

const validateShippingAddress = (address: Record<string, unknown> | null | undefined): void => {
  if (address === undefined || address === null) return;
  if (typeof address !== 'object' || Array.isArray(address)) {
    throw new OrderValidationError('shippingAddress must be an object when provided');
  }
};

const validateCreateOrderInput = (input: CreateOrderInput): void => {
  if (!input.lines?.length) throw new OrderValidationError('at least one line item is required');
  validateShippingAddress(input.shippingAddress ?? null);
  for (const line of input.lines) validateOrderLineInput(line);
};

interface OrderRow {
  id: string;
  user_id: string | null;
  status: string;
  total_amount: string;
  shipping_address: Record<string, unknown> | null;
  created_at: string | Date;
  updated_at: string | Date;
}

const mapOrderRow = (row: OrderRow): Order => ({
  id: row.id,
  userId: row.user_id ?? null,
  status: row.status,
  totalAmount: Number(row.total_amount),
  shippingAddress: row.shipping_address ?? null,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

export const createOrder = async (
  input: CreateOrderInput,
  pool: Pool = getPool()
): Promise<Order> => {
  validateCreateOrderInput(input);

  const totalAmount = input.lines.reduce((sum, line) => sum + line.finalPrice * line.quantity, 0);
  const status = input.status?.trim() || 'pending';

  const client =
    typeof (pool as unknown as { connect?: () => unknown }).connect === 'function'
      ? await (pool as unknown as { connect: () => Promise<Pool> }).connect()
      : (pool as unknown as Pool);

  try {
    // Begin transaction when using a client connection
    if ('query' in client) {
      await client.query('BEGIN');
    }

    const orderResult = await client.query<OrderRow>(
      `
        INSERT INTO orders (user_id, status, total_amount, shipping_address)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, status, total_amount, shipping_address, created_at, updated_at
      `,
      [input.userId ?? null, status, totalAmount, input.shippingAddress ?? null]
    );

    const orderRow = orderResult.rows[0];
    const lines: OrderLine[] = [];

    for (const line of input.lines) {
      const createdLine = await createOrderLine(orderRow.id, line, client as unknown as Pool);
      lines.push(createdLine);
    }

    if ('query' in client) {
      await client.query('COMMIT');
    }

    return { ...mapOrderRow(orderRow), lines };
  } catch (error) {
    if ('query' in client) {
      await client.query('ROLLBACK');
    }
    throw error;
  } finally {
    if ('release' in client && typeof (client as { release: () => void }).release === 'function') {
      (client as { release: () => void }).release();
    }
  }
};

export const getOrderById = async (id: string, pool: Pool = getPool()): Promise<Order | null> => {
  const result = await pool.query<OrderRow>(
    `
      SELECT id, user_id, status, total_amount, shipping_address, created_at, updated_at
      FROM orders
      WHERE id = $1
    `,
    [id]
  );

  const row = result.rows[0];
  if (!row) return null;

  const lines = await listOrderLines(id, pool);
  return { ...mapOrderRow(row), lines };
};

export const updateOrderStatus = async (
  id: string,
  status: string,
  pool: Pool = getPool()
): Promise<Order> => {
  if (!status?.trim()) throw new OrderValidationError('status is required');

  const result = await pool.query<OrderRow>(
    `
      UPDATE orders
      SET status = $1, updated_at = now()
      WHERE id = $2
      RETURNING id, user_id, status, total_amount, shipping_address, created_at, updated_at
    `,
    [status.trim(), id]
  );

  const row = result.rows[0];
  if (!row) throw new OrderNotFoundError(id);

  return mapOrderRow(row);
};
