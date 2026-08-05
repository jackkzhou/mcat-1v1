/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createTable('passages', {
        id: 'id',
        passageText: {type: 'text', notNull: true},
        passageImageUrl: {type: 'text'},
        passageImageUrl2: {type: 'text'},
        passageImageUrl3: {type: 'text'},
        passageImageUrl4: {type: 'text'},
        category: {type: 'text', notNull: true},
        createdAt: {type: 'timestamp', notNull: true, default: pgm.func('current_timestamp')},
    })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('passages');
};
