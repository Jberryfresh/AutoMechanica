'use strict';

exports.up = async (pgm) => {
  pgm.createTable('workflows', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },
    type: { type: 'text', notNull: true },
    state: { type: 'text', notNull: true },
    context: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('workflows', 'state', { name: 'workflows_state_idx' });

  pgm.createTable('agent_events', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },
    workflow_id: {
      type: 'uuid',
      references: 'workflows',
      onDelete: 'SET NULL',
    },
    agent_name: { type: 'text', notNull: true },
    task_type: { type: 'text', notNull: true },
    input_data: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    output_data: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    reasoning: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('agent_events', 'workflow_id', { name: 'agent_events_workflow_id_idx' });
  pgm.createIndex('agent_events', [{ name: 'reasoning', opclass: 'gin_trgm_ops' }], {
    name: 'agent_events_reasoning_fts_idx',
    method: 'gin',
  });
};

exports.down = async (pgm) => {
  pgm.dropIndex('agent_events', [{ name: 'reasoning', opclass: 'gin_trgm_ops' }], {
    name: 'agent_events_reasoning_fts_idx',
  });
  pgm.dropIndex('agent_events', 'workflow_id', { name: 'agent_events_workflow_id_idx' });
  pgm.dropTable('agent_events');

  pgm.dropIndex('workflows', 'state', { name: 'workflows_state_idx' });
  pgm.dropTable('workflows');
};
