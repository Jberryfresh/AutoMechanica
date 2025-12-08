'use strict';

exports.up = async (pgm) => {
  // Ensure UUID generation is available
  await pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.createTable('vehicles', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },
    year: { type: 'integer', notNull: true },
    make: { type: 'text', notNull: true },
    model: { type: 'text', notNull: true },
    trim: { type: 'text' },
    engine: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint(
    'vehicles',
    'vehicles_unique_year_make_model_trim_engine',
    "UNIQUE (year, make, model, COALESCE(trim, ''), engine)"
  );

  pgm.createIndex('vehicles', ['make', 'model', 'year'], {
    name: 'vehicles_make_model_year_idx',
  });
};

exports.down = async (pgm) => {
  pgm.dropIndex('vehicles', ['make', 'model', 'year'], { name: 'vehicles_make_model_year_idx' });
  pgm.dropConstraint('vehicles', 'vehicles_unique_year_make_model_trim_engine');
  pgm.dropTable('vehicles');
};
