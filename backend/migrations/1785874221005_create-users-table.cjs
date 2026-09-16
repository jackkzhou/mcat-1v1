/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('users', {
    id: 'id',
    username: {type: 'text', notNull: true, unique: true},
    rating: {type: 'integer', notNull: true, default: 1000},
    email: {type: 'text', notNull: true, unique: true},
    password_hash: {type: 'text', notNull: true},
    created_at: {type: 'timestamp', notNull: true, default: pgm.func('current_timestamp')}
    })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('users');
};