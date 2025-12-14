'use strict';

exports.up = async (pgm) => {
  pgm.createTable('tasks', {
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
    payload: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    priority: { type: 'integer', notNull: true, default: 10 },
    status: { type: 'text', notNull: true, default: 'pending' },
    attempts: { type: 'integer', notNull: true, default: 0 },
    max_attempts: { type: 'integer', notNull: true, default: 5 },
    available_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    lease_owner: { type: 'text' },
    lease_expires_at: { type: 'timestamptz' },
    error_info: { type: 'jsonb' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('tasks', 'tasks_priority_positive', 'CHECK (priority >= 0)');
  pgm.addConstraint(
    'tasks',
    'tasks_status_valid',
    "CHECK (status IN ('pending','leased','running','completed','failed','dead'))"
  );
  pgm.addConstraint('tasks', 'tasks_attempts_positive', 'CHECK (attempts >= 0 AND max_attempts > 0)');

  pgm.createIndex('tasks', ['status', 'available_at', 'priority'], {
    name: 'tasks_status_available_priority_idx',
  });
  pgm.createIndex('tasks', 'workflow_id', { name: 'tasks_workflow_id_idx' });
};

exports.down = async (pgm) => {
  pgm.dropIndex('tasks', 'workflow_id', { name: 'tasks_workflow_id_idx' });
  pgm.dropIndex('tasks', ['status', 'available_at', 'priority'], { name: 'tasks_status_available_priority_idx' });
  pgm.dropConstraint('tasks', 'tasks_attempts_positive');
  pgm.dropConstraint('tasks', 'tasks_status_valid');
  pgm.dropConstraint('tasks', 'tasks_priority_positive');
  pgm.dropTable('tasks');
};
