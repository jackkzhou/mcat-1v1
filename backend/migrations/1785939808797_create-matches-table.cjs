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
    pgm.createTable('matches', {
        id: 'id',
        player1_id: {type: 'integer', notNull: true, references: 'users'},
        player2_id: {type: 'integer', notNull: true, references: 'users'},
        winner_id: {type: 'integer', references: 'users'},
        created_at: {type: 'timestamp', notNull: true, default: pgm.func('current_timestamp')},
    })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('matches');
};
