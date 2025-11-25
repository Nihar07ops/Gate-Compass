# Authentication Routes

This directory contains the authentication routes and their tests for GATE COMPASS.

## Files

- `auth.ts` - Authentication routes (Google OAuth, token refresh, logout)
- `auth.property.test.ts` - Property-based tests for authentication

## Running Property-Based Tests

The property-based tests in `auth.property.test.ts` validate authentication behavior across many randomly generated inputs (100 iterations per property).

### Prerequisites

These tests require a running PostgreSQL database because they validate actual database operations (user creation and retrieval).

### Setup

1. **Start the database:**
   ```bash
   docker-compose up -d postgres
   ```

2. **Run migrations:**
   ```bash
   cd backend
   npm run migrate up
   ```

3. **Run the tests:**
   ```bash
   npm test -- auth.property.test.ts
   ```

### What the Tests Validate

#### Property 1: OAuth redirect correctness
Validates that for any user clicking the Google login button, the system redirects to Google's OAuth page with valid client ID, redirect URI, and required scopes.

**Validates:** Requirements 1.2

#### Property 2: User profile creation or retrieval
Validates that for any successful Google authentication response, the system either:
- Creates a new user profile (if googleId doesn't exist), OR
- Retrieves the existing user profile (if googleId exists)

And in both cases grants platform access.

**Validates:** Requirements 1.3

### Test Coverage

Each property test runs 100 iterations with randomly generated data to ensure the properties hold across a wide range of inputs.

### Troubleshooting

**Error: "Database connection required"**
- Make sure Docker is installed and running
- Start the database: `docker-compose up -d postgres`
- Verify the database is running: `docker ps`

**Error: "relation 'users' does not exist"**
- Run the database migrations: `npm run migrate up`

**Error: "Connection timeout"**
- Check that PostgreSQL is accessible on port 5432
- Verify environment variables in `.env.development`

### Alternative: Running Without Docker

If Docker is not available in your environment, you can:

1. **Install PostgreSQL locally** on your machine
2. **Update `.env.development`** with your local PostgreSQL credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=gatecompass_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   ```
3. **Create the database:**
   ```sql
   CREATE DATABASE gatecompass_db;
   ```
4. **Run migrations** as described above

### CI/CD Considerations

For continuous integration environments, consider:
- Using a test database separate from development
- Setting up database fixtures for consistent test data
- Running migrations automatically before tests
- Cleaning up test data after test runs
