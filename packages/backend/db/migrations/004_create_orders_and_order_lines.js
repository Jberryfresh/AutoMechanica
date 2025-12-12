'use strict';

exports.up = async (pgm) => {
  pgm.createTable('orders', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: { type: 'uuid' },
    status: { type: 'text', notNull: true, default: 'pending' },
    total_amount: { type: 'numeric', notNull: true },
    shipping_address: { type: 'jsonb' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createTable('order_lines', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },
    order_id: {
      type: 'uuid',
      notNull: true,
      references: 'orders',
      onDelete: 'CASCADE',
    },
    canonical_part_id: {
      type: 'uuid',
      notNull: true,
      references: 'parts',
      onDelete: 'RESTRICT',
    },
    quantity: { type: 'integer', notNull: true },
    final_price: { type: 'numeric', notNull: true },
    fitment_confidence: { type: 'real' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('order_lines', 'order_lines_quantity_positive', 'CHECK (quantity > 0)');
  pgm.addConstraint(
    'order_lines',
    'order_lines_fitment_confidence_range',
    'CHECK (fitment_confidence IS NULL OR (fitment_confidence >= 0 AND fitment_confidence <= 1))'
  );

  pgm.createIndex('orders', 'status', { name: 'orders_status_idx' });
  pgm.createIndex('order_lines', 'order_id', { name: 'order_lines_order_id_idx' });
  pgm.createIndex('order_lines', 'canonical_part_id', { name: 'order_lines_part_id_idx' });
};

exports.down = async (pgm) => {
  pgm.dropIndex('order_lines', 'canonical_part_id', { name: 'order_lines_part_id_idx' });
  pgm.dropIndex('order_lines', 'order_id', { name: 'order_lines_order_id_idx' });
  pgm.dropIndex('orders', 'status', { name: 'orders_status_idx' });
  pgm.dropConstraint('order_lines', 'order_lines_fitment_confidence_range');
  pgm.dropConstraint('order_lines', 'order_lines_quantity_positive');
  pgm.dropTable('order_lines');
  pgm.dropTable('orders');
};
