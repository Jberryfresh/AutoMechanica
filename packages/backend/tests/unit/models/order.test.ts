/* eslint-disable import/order */
import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  OrderValidationError,
  createOrder,
  getOrderById,
  updateOrderStatus,
  type OrderStatus,
} from '../../../src/models/Order.js';
import { OrderLineValidationError } from '../../../src/models/OrderLine.js';

import type { Pool } from 'pg';

interface FakeQueryResult<T = unknown> {
  rows: T[];
}

interface FakePool {
  query: (text: string, params?: unknown[]) => Promise<FakeQueryResult>;
}

interface OrderRow {
  id: string;
  user_id: string | null;
  status: string;
  total_amount: string;
  shipping_address: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

interface OrderLineRow {
  id: string;
  order_id: string;
  canonical_part_id: string;
  quantity: number;
  final_price: string;
  fitment_confidence: number | null;
  created_at: string;
}

const createFakePool = (orders: OrderRow[] = [], lines: OrderLineRow[] = []): FakePool => {
  return {
    async query(text: string, params: unknown[] = []): Promise<FakeQueryResult> {
      await Promise.resolve();

      if (text.startsWith('BEGIN') || text.startsWith('COMMIT') || text.startsWith('ROLLBACK')) {
        return { rows: [] };
      }

      if (text.includes('INSERT INTO orders')) {
        const [userId, status, totalAmount, shippingAddress] = params as [
          string | null,
          string,
          number,
          Record<string, unknown> | null,
        ];
        const row: OrderRow = {
          id: randomUUID(),
          user_id: userId ?? null,
          status,
          total_amount: totalAmount.toString(),
          shipping_address: shippingAddress ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        orders.push(row);
        return { rows: [row] };
      }

      if (text.includes('INSERT INTO order_lines')) {
        const [orderId, partId, quantity, finalPrice, fitmentConfidence] = params as [
          string,
          string,
          number,
          number,
          number | null,
        ];
        const row: OrderLineRow = {
          id: randomUUID(),
          order_id: orderId,
          canonical_part_id: partId,
          quantity,
          final_price: finalPrice.toString(),
          fitment_confidence: fitmentConfidence ?? null,
          created_at: new Date().toISOString(),
        };
        lines.push(row);
        return { rows: [row] };
      }

      if (text.includes('FROM orders') && text.includes('WHERE id = $1')) {
        const found = orders.find((o) => o.id === params[0]);
        return { rows: found ? [found] : [] };
      }

      if (text.includes('FROM order_lines') && text.includes('WHERE order_id = $1')) {
        const byOrder = lines
          .filter((l) => l.order_id === params[0])
          .sort((a, b) => a.created_at.localeCompare(b.created_at));
        return { rows: byOrder };
      }

      if (text.includes('UPDATE orders')) {
        const [status, id] = params as [string, string];
        const index = orders.findIndex((o) => o.id === id);
        if (index === -1) return { rows: [] };
        orders[index] = { ...orders[index], status, updated_at: new Date().toISOString() };
        return { rows: [orders[index]] };
      }

      return { rows: [] };
    },
  };
};

describe('Order model', () => {
  it('creates an order with lines and computes totals', async () => {
    const orderStore: OrderRow[] = [];
    const lineStore: OrderLineRow[] = [];
    const pool = createFakePool(orderStore, lineStore) as unknown as Pool;

    const order = await createOrder(
      {
        userId: 'user-1',
        shippingAddress: { city: 'Austin' },
        lines: [
          { canonicalPartId: 'part-1', quantity: 2, finalPrice: 50 },
          { canonicalPartId: 'part-2', quantity: 1, finalPrice: 25, fitmentConfidence: 0.9 },
        ],
      },
      pool
    );

    expect(order.status).toBe('pending');
    expect(order.totalAmount).toBe(125);
    expect(order.lines).toHaveLength(2);

    // Stores received inserts
    expect(orderStore).toHaveLength(1);
    expect(lineStore).toHaveLength(2);
  });

  it('fetches an order with its lines', async () => {
    const orderStore: OrderRow[] = [
      {
        id: 'order-1',
        user_id: 'user-1',
        status: 'pending',
        total_amount: '75',
        shipping_address: { city: 'Austin' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    const lineStore: OrderLineRow[] = [
      {
        id: 'line-1',
        order_id: 'order-1',
        canonical_part_id: 'part-1',
        quantity: 1,
        final_price: '50',
        fitment_confidence: 0.8,
        created_at: new Date().toISOString(),
      },
      {
        id: 'line-2',
        order_id: 'order-1',
        canonical_part_id: 'part-2',
        quantity: 1,
        final_price: '25',
        fitment_confidence: null,
        created_at: new Date().toISOString(),
      },
    ];
    const pool = createFakePool(orderStore, lineStore) as unknown as Pool;

    const fetched = await getOrderById('order-1', pool);
    expect(fetched?.id).toBe('order-1');
    expect(fetched?.lines?.map((l) => l.id)).toEqual(['line-1', 'line-2']);
  });

  it('updates order status', async () => {
    const orderStore: OrderRow[] = [
      {
        id: 'order-1',
        user_id: null,
        status: 'pending',
        total_amount: '10',
        shipping_address: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    const pool = createFakePool(orderStore, []) as unknown as Pool;

    const updated = await updateOrderStatus('order-1', 'confirmed', pool);
    expect(updated.status).toBe('confirmed');
    expect(orderStore[0].status).toBe('confirmed');
  });

  it('validates line inputs', async () => {
    const pool = createFakePool() as unknown as Pool;

    await expect(
      createOrder(
        { userId: 'user-1', lines: [{ canonicalPartId: 'part-1', quantity: 0, finalPrice: 10 }] },
        pool
      )
    ).rejects.toBeInstanceOf(OrderLineValidationError);

    await expect(createOrder({ userId: 'user-1', lines: [] }, pool)).rejects.toBeInstanceOf(
      OrderValidationError
    );
  });

  it('rejects unsupported order statuses', async () => {
    const pool = createFakePool() as unknown as Pool;

    await expect(
      createOrder(
        {
          status: 'bogus' as unknown as OrderStatus,
          lines: [{ canonicalPartId: 'part-1', quantity: 1, finalPrice: 10 }],
        },
        pool
      )
    ).rejects.toBeInstanceOf(OrderValidationError);

    await expect(
      updateOrderStatus('order-1', 'not-a-status' as unknown as OrderStatus, pool)
    ).rejects.toBeInstanceOf(OrderValidationError);
  });
});
