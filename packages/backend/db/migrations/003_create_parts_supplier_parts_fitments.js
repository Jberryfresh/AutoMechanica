'use strict';

exports.up = async (pgm) => {
  pgm.createTable('parts', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: { type: 'text', notNull: true },
    category: { type: 'text', notNull: true },
    brand: { type: 'text' },
    description: { type: 'text' },
    attributes: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('parts', 'category', { name: 'parts_category_idx' });
  pgm.createIndex('parts', 'attributes', { name: 'parts_attributes_gin_idx', method: 'gin' });

  pgm.createTable('supplier_parts', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },
    supplier_id: { type: 'text', notNull: true },
    supplier_sku: { type: 'text', notNull: true },
    raw_data: { type: 'jsonb', notNull: true },
    normalized_data: { type: 'jsonb' },
    canonical_part_id: {
      type: 'uuid',
      references: 'parts',
      onDelete: 'SET NULL',
    },
    cost: { type: 'numeric' },
    availability: { type: 'text' },
    lead_time_days: { type: 'integer' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint(
    'supplier_parts',
    'supplier_parts_unique_supplier_sku',
    'UNIQUE (supplier_id, supplier_sku)'
  );
  pgm.createIndex('supplier_parts', 'canonical_part_id', { name: 'supplier_parts_canonical_part_idx' });
  pgm.createIndex('supplier_parts', 'raw_data', { name: 'supplier_parts_raw_data_gin_idx', method: 'gin' });
  pgm.createIndex('supplier_parts', 'normalized_data', {
    name: 'supplier_parts_normalized_data_gin_idx',
    method: 'gin',
  });

  pgm.createTable('fitments', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },
    canonical_part_id: {
      type: 'uuid',
      notNull: true,
      references: 'parts',
      onDelete: 'CASCADE',
    },
    vehicle_id: {
      type: 'uuid',
      notNull: true,
      references: 'vehicles',
      onDelete: 'CASCADE',
    },
    confidence: { type: 'real', notNull: true },
    evidence: { type: 'jsonb' },
    source: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('fitments', 'fitments_confidence_range', 'CHECK (confidence >= 0 AND confidence <= 1)');
  pgm.addConstraint(
    'fitments',
    'fitments_unique_part_vehicle',
    'UNIQUE (canonical_part_id, vehicle_id)'
  );
  pgm.createIndex('fitments', ['vehicle_id', 'confidence'], { name: 'fitments_vehicle_confidence_idx' });
  pgm.createIndex('fitments', 'canonical_part_id', { name: 'fitments_canonical_part_idx' });
};

exports.down = async (pgm) => {
  pgm.dropIndex('fitments', 'canonical_part_id', { name: 'fitments_canonical_part_idx' });
  pgm.dropIndex('fitments', ['vehicle_id', 'confidence'], { name: 'fitments_vehicle_confidence_idx' });
  pgm.dropConstraint('fitments', 'fitments_unique_part_vehicle');
  pgm.dropConstraint('fitments', 'fitments_confidence_range');
  pgm.dropTable('fitments');

  pgm.dropIndex('supplier_parts', 'normalized_data', { name: 'supplier_parts_normalized_data_gin_idx' });
  pgm.dropIndex('supplier_parts', 'raw_data', { name: 'supplier_parts_raw_data_gin_idx' });
  pgm.dropIndex('supplier_parts', 'canonical_part_id', { name: 'supplier_parts_canonical_part_idx' });
  pgm.dropConstraint('supplier_parts', 'supplier_parts_unique_supplier_sku');
  pgm.dropTable('supplier_parts');

  pgm.dropIndex('parts', 'attributes', { name: 'parts_attributes_gin_idx' });
  pgm.dropIndex('parts', 'category', { name: 'parts_category_idx' });
  pgm.dropTable('parts');
};
