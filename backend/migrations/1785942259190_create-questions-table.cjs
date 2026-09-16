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
    pgm.createTable('questions',{
        id: 'id',
        passage_id: {type: 'integer', notNull: true, references: 'passages'},
        question_text: {type: 'text', notNull: true},
        image_url: {type: 'text'},
        created_at: {type: 'timestamp', notNull: true, default: pgm.func('current_timestamp')},
    })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('questions');
};
