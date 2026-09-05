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
    pgm.createTable('answer_choices', {
        id: 'id',
        questionId: {type: 'integer', notNull: true, references: 'questions'},
        choiceText: {type: 'text', notNull: true},
        imageUrl: {type: 'text'},
        isCorrect: {type: 'boolean', notNull: true, default: false},
        createdAt: {type: 'timestamp', notNull: true, default: pgm.func('current_timestamp')},
    })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('answer_choices');
};
