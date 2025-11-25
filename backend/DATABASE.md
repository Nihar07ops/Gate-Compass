# Database Setup Guide

This document provides comprehensive information about the GATE COMPASS database schema, setup, and usage.

## Overview

GATE COMPASS uses PostgreSQL as its primary database with the following key features:
- UUID-based primary keys for all tables
- JSONB columns for flexible data storage (options, trends, feedback)
- Comprehensive indexing for query performance
- Foreign key constraints for referential integrity
- Automatic timestamp management

## Quick Start

### 1. Start PostgreSQL (via Docker Compose)

```bash
docker-compose up -d postgres
```

### 2. Configure Environment Variables

Update `backend/.env.development` with your database credentials:

```env
DATABASE_URL=postgresql://gatecompass:gatecompass_dev@localhost:5432/gatecompass_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gatecompass_db
DB_USER=gatecompass
DB_PASSWORD=gatecompass_dev
```

### 3. Run Migrations

```bash
cd backend
npm run migrate:up
```

### 4. Verify Connection

Start the backend server to test the database connection:

```bash
npm run dev
```

You should see: "Database connection established successfully"

## Database Schema

### Tables

#### users
Stores user account information from Google OAuth.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| google_id | VARCHAR(255) | Google OAuth ID (unique) |
| email | VARCHAR(255) | User email (unique) |
| name | VARCHAR(255) | User display name |
| profile_picture | TEXT | URL to profile image |
| role | VARCHAR(50) | User role (user/admin) |
| created_at | TIMESTAMP | Account creation time |
| last_login_at | TIMESTAMP | Last login timestamp |

**Indexes:** google_id, email

#### concepts
Stores GATE CSIT concepts and categories.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Concept name (unique) |
| category | VARCHAR(255) | Concept category |
| description | TEXT | Detailed description |
| created_at | TIMESTAMP | Creation time |

**Indexes:** name, category

#### questions
Question bank with metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| content | TEXT | Question text |
| options | JSONB | Answer options array |
| correct_answer | VARCHAR(10) | Correct option ID |
| explanation | TEXT | Answer explanation |
| concept_id | UUID | Foreign key to concepts |
| sub_concept | VARCHAR(255) | Optional sub-concept |
| difficulty | VARCHAR(50) | easy/medium/hard |
| source | TEXT | Textbook reference |
| year_appeared | INTEGER | GATE year (if applicable) |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

**Indexes:** concept_id, difficulty, year_appeared

#### tests
Generated mock tests.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| question_ids | JSONB | Array of question IDs |
| total_questions | INTEGER | Number of questions |
| duration | INTEGER | Test duration (seconds) |
| created_at | TIMESTAMP | Creation time |

#### test_sessions
Active and completed test sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| test_id | UUID | Foreign key to tests |
| start_time | TIMESTAMP | Session start time |
| end_time | TIMESTAMP | Session end time (nullable) |
| status | VARCHAR(50) | in_progress/completed/auto_submitted |
| total_time_spent | INTEGER | Total time in seconds |
| created_at | TIMESTAMP | Creation time |

**Indexes:** user_id, test_id, status, (user_id, created_at)

#### session_answers
User answers for each question in a session.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | Foreign key to test_sessions |
| question_id | UUID | Foreign key to questions |
| selected_answer | VARCHAR(10) | Selected option ID |
| marked_for_review | BOOLEAN | Review flag |
| answered_at | TIMESTAMP | Answer timestamp |

**Unique Constraint:** (session_id, question_id)
**Indexes:** session_id, question_id

#### question_times
Time tracking for each question.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | Foreign key to test_sessions |
| question_id | UUID | Foreign key to questions |
| time_spent | INTEGER | Time in seconds |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

**Unique Constraint:** (session_id, question_id)
**Indexes:** session_id, question_id

#### test_results
Calculated results and analytics.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | Foreign key to test_sessions (unique) |
| user_id | UUID | Foreign key to users |
| score | INTEGER | Total score |
| total_questions | INTEGER | Number of questions |
| correct_answers | INTEGER | Correct count |
| incorrect_answers | INTEGER | Incorrect count |
| unanswered | INTEGER | Unanswered count |
| percentage | DECIMAL(5,2) | Score percentage |
| concept_performance | JSONB | Performance by concept |
| feedback | JSONB | Personalized feedback |
| created_at | TIMESTAMP | Creation time |

**Indexes:** session_id, user_id, (user_id, created_at)

#### concept_trends
Trend analysis data for concepts.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| concept_id | UUID | Foreign key to concepts (unique) |
| frequency | DECIMAL(5,4) | Occurrence frequency |
| importance | DECIMAL(5,4) | Importance score |
| yearly_distribution | JSONB | Year-wise distribution |
| last_updated | TIMESTAMP | Last update time |

**Indexes:** concept_id, importance, frequency

## TypeScript Types

All database models have corresponding TypeScript interfaces in `src/types/models.ts`:

- `User`, `UserRow`
- `Concept`, `ConceptRow`
- `Question`, `QuestionRow`
- `Test`, `TestRow`
- `TestSession`, `TestSessionRow`
- `SessionAnswer`, `SessionAnswerRow`
- `QuestionTime`, `QuestionTimeRow`
- `TestResult`, `TestResultRow`
- `ConceptTrend`, `ConceptTrendRow`

## Database Utilities

### Connection Pool (`src/config/database.ts`)

```typescript
import { query, getClient, testConnection, closePool } from './config/database';

// Execute a simple query
const result = await query('SELECT * FROM users WHERE id = $1', [userId]);

// Get a client for transactions
const client = await getClient();
try {
  await client.query('BEGIN');
  // ... transaction queries
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}

// Test connection
const isConnected = await testConnection();

// Close pool (for graceful shutdown)
await closePool();
```

### Model Mappers (`src/utils/modelMappers.ts`)

Utility functions to convert database rows to application models:

```typescript
import { mapQuestionRowToModel, mapTestRowToModel } from './utils/modelMappers';

const questionRow = await query('SELECT * FROM questions WHERE id = $1', [id]);
const question = mapQuestionRowToModel(questionRow.rows[0]);
```

## Migration Management

### Create a New Migration

```bash
npm run migrate:create <migration-name>
```

Example:
```bash
npm run migrate:create add-user-preferences
```

### Apply Migrations

```bash
npm run migrate:up
```

### Rollback Last Migration

```bash
npm run migrate:down
```

### Check Migration Status

Migrations are tracked in the `pgmigrations` table.

## Performance Considerations

### Indexes

The schema includes indexes on:
- Foreign keys for join performance
- Frequently queried columns (user_id, concept_id, status)
- Composite indexes for common query patterns (user_id + created_at)

### Connection Pooling

The connection pool is configured with:
- Max connections: 20 (configurable via `DB_POOL_MAX`)
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

### JSONB Columns

JSONB columns are used for:
- Question options (flexible structure)
- Test question IDs (array storage)
- Concept performance (nested data)
- Feedback (complex structure)
- Yearly distribution (key-value pairs)

JSONB provides:
- Efficient storage and querying
- Flexibility for evolving data structures
- Native PostgreSQL indexing support

## Best Practices

1. **Always use parameterized queries** to prevent SQL injection
2. **Use transactions** for multi-step operations
3. **Release clients** after use to return them to the pool
4. **Handle errors** appropriately with try-catch blocks
5. **Use model mappers** to convert database rows to application models
6. **Test migrations** in development before applying to production
7. **Monitor connection pool** usage and adjust max connections as needed

## Troubleshooting

### Connection Issues

If you see "Failed to connect to database":
1. Verify PostgreSQL is running: `docker-compose ps`
2. Check environment variables in `.env.development`
3. Verify database exists: `docker-compose exec postgres psql -U gatecompass -l`
4. Check network connectivity

### Migration Errors

If migrations fail:
1. Check the `pgmigrations` table to see which migrations have run
2. Review migration logs for specific errors
3. Manually rollback if needed: `npm run migrate:down`
4. Fix the migration file and re-run

### Performance Issues

If queries are slow:
1. Check for missing indexes
2. Use `EXPLAIN ANALYZE` to understand query plans
3. Monitor connection pool usage
4. Consider adding database-specific indexes for your query patterns

## Security

- All passwords should be strong and unique
- Use environment variables for credentials (never commit to git)
- Enable SSL for production database connections
- Implement row-level security if needed
- Regularly backup the database
- Use prepared statements (parameterized queries) to prevent SQL injection
