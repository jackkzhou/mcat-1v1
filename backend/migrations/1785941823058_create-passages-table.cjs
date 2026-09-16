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
    pgm.createTable('passages', {
                id: 'id',
        passage_text: {type: 'text', notNull: true},
        passage_image_url: {type: 'text'},
        passage_image_url_2: {type: 'text'},
        passage_image_url_3: {type: 'text'},
        passage_image_url_4: {type: 'text'},
        category: {type: 'text', notNull: true},
        created_at: {type: 'timestamp', notNull: true, default: pgm.func('current_timestamp')},
    })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('passages');
};
