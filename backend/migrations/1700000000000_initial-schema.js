/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    // Enable UUID extension
    pgm.createExtension('uuid-ossp', { ifNotExists: true });

    // Create users table
    pgm.createTable('users', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('uuid_generate_v4()'),
        },
        google_id: {
            type: 'varchar(255)',
            notNull: true,
            unique: true,
        },
        email: {
            type: 'varchar(255)',
            notNull: true,
            unique: true,
        },
        name: {
            type: 'varchar(255)',
            notNull: true,
        },
        profile_picture: {
            type: 'text',
        },
        role: {
            type: 'varchar(50)',
            notNull: true,
            default: 'user',
            check: "role IN ('user', 'admin')",
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        last_login_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // Create indexes on users table
    pgm.createIndex('users', 'google_id');
    pgm.createIndex('users', 'email');

    // Create concepts table
    pgm.createTable('concepts', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('uuid_generate_v4()'),
        },
        name: {
            type: 'varchar(255)',
            notNull: true,
            unique: true,
        },
        category: {
            type: 'varchar(255)',
            notNull: true,
        },
        description: {
            type: 'text',
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // Create indexes on concepts table
    pgm.createIndex('concepts', 'name');
    pgm.createIndex('concepts', 'category');

    // Create questions table
    pgm.createTable('questions', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('uuid_generate_v4()'),
        },
        content: {
            type: 'text',
            notNull: true,
        },
        options: {
            type: 'jsonb',
            notNull: true,
        },
        correct_answer: {
            type: 'varchar(10)',
            notNull: true,
        },
        explanation: {
            type: 'text',
            notNull: true,
        },
        concept_id: {
            type: 'uuid',
            notNull: true,
            references: 'concepts',
            onDelete: 'RESTRICT',
        },
        sub_concept: {
            type: 'varchar(255)',
        },
        difficulty: {
            type: 'varchar(50)',
            notNull: true,
            check: "difficulty IN ('easy', 'medium', 'hard')",
        },
        source: {
            type: 'text',
            notNull: true,
        },
        year_appeared: {
            type: 'integer',
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // Create indexes on questions table
    pgm.createIndex('questions', 'concept_id');
    pgm.createIndex('questions', 'difficulty');
    pgm.createIndex('questions', 'year_appeared');

    // Create tests table
    pgm.createTable('tests', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('uuid_generate_v4()'),
        },
        question_ids: {
            type: 'jsonb',
            notNull: true,
        },
        total_questions: {
            type: 'integer',
            notNull: true,
        },
        duration: {
            type: 'integer',
            notNull: true,
            comment: 'Duration in seconds',
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // Create test_sessions table
    pgm.createTable('test_sessions', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('uuid_generate_v4()'),
        },
        user_id: {
            type: 'uuid',
            notNull: true,
            references: 'users',
            onDelete: 'CASCADE',
        },
        test_id: {
            type: 'uuid',
            notNull: true,
            references: 'tests',
            onDelete: 'CASCADE',
        },
        start_time: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        end_time: {
            type: 'timestamp',
        },
        status: {
            type: 'varchar(50)',
            notNull: true,
            default: 'in_progress',
            check: "status IN ('in_progress', 'completed', 'auto_submitted')",
        },
        total_time_spent: {
            type: 'integer',
            notNull: true,
            default: 0,
            comment: 'Total time spent in seconds',
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // Create indexes on test_sessions table
    pgm.createIndex('test_sessions', 'user_id');
    pgm.createIndex('test_sessions', 'test_id');
    pgm.createIndex('test_sessions', 'status');
    pgm.createIndex('test_sessions', ['user_id', 'created_at']);

    // Create session_answers table
    pgm.createTable('session_answers', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('uuid_generate_v4()'),
        },
        session_id: {
            type: 'uuid',
            notNull: true,
            references: 'test_sessions',
            onDelete: 'CASCADE',
        },
        question_id: {
            type: 'uuid',
            notNull: true,
            references: 'questions',
            onDelete: 'CASCADE',
        },
        selected_answer: {
            type: 'varchar(10)',
            notNull: true,
        },
        marked_for_review: {
            type: 'boolean',
            notNull: true,
            default: false,
        },
        answered_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // Create unique constraint to prevent duplicate answers for same question in session
    pgm.createConstraint('session_answers', 'unique_session_question', {
        unique: ['session_id', 'question_id'],
    });

    // Create indexes on session_answers table
    pgm.createIndex('session_answers', 'session_id');
    pgm.createIndex('session_answers', 'question_id');

    // Create question_times table
    pgm.createTable('question_times', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('uuid_generate_v4()'),
        },
        session_id: {
            type: 'uuid',
            notNull: true,
            references: 'test_sessions',
            onDelete: 'CASCADE',
        },
        question_id: {
            type: 'uuid',
            notNull: true,
            references: 'questions',
            onDelete: 'CASCADE',
        },
        time_spent: {
            type: 'integer',
            notNull: true,
            default: 0,
            comment: 'Time spent in seconds',
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // Create unique constraint for session-question combination
    pgm.createConstraint('question_times', 'unique_session_question_time', {
        unique: ['session_id', 'question_id'],
    });

    // Create indexes on question_times table
    pgm.createIndex('question_times', 'session_id');
    pgm.createIndex('question_times', 'question_id');

    // Create test_results table
    pgm.createTable('test_results', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('uuid_generate_v4()'),
        },
        session_id: {
            type: 'uuid',
            notNull: true,
            unique: true,
            references: 'test_sessions',
            onDelete: 'CASCADE',
        },
        user_id: {
            type: 'uuid',
            notNull: true,
            references: 'users',
            onDelete: 'CASCADE',
        },
        score: {
            type: 'integer',
            notNull: true,
        },
        total_questions: {
            type: 'integer',
            notNull: true,
        },
        correct_answers: {
            type: 'integer',
            notNull: true,
        },
        incorrect_answers: {
            type: 'integer',
            notNull: true,
        },
        unanswered: {
            type: 'integer',
            notNull: true,
        },
        percentage: {
            type: 'decimal(5,2)',
            notNull: true,
        },
        concept_performance: {
            type: 'jsonb',
            notNull: true,
        },
        feedback: {
            type: 'jsonb',
            notNull: true,
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // Create indexes on test_results table
    pgm.createIndex('test_results', 'session_id');
    pgm.createIndex('test_results', 'user_id');
    pgm.createIndex('test_results', ['user_id', 'created_at']);

    // Create concept_trends table
    pgm.createTable('concept_trends', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('uuid_generate_v4()'),
        },
        concept_id: {
            type: 'uuid',
            notNull: true,
            unique: true,
            references: 'concepts',
            onDelete: 'CASCADE',
        },
        frequency: {
            type: 'decimal(5,4)',
            notNull: true,
            default: 0,
        },
        importance: {
            type: 'decimal(5,4)',
            notNull: true,
            default: 0,
        },
        yearly_distribution: {
            type: 'jsonb',
            notNull: true,
            default: '{}',
        },
        last_updated: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // Create indexes on concept_trends table
    pgm.createIndex('concept_trends', 'concept_id');
    pgm.createIndex('concept_trends', 'importance');
    pgm.createIndex('concept_trends', 'frequency');
};

exports.down = (pgm) => {
    // Drop tables in reverse order to handle foreign key constraints
    pgm.dropTable('concept_trends');
    pgm.dropTable('test_results');
    pgm.dropTable('question_times');
    pgm.dropTable('session_answers');
    pgm.dropTable('test_sessions');
    pgm.dropTable('tests');
    pgm.dropTable('questions');
    pgm.dropTable('concepts');
    pgm.dropTable('users');

    // Drop extension
    pgm.dropExtension('uuid-ossp');
};
