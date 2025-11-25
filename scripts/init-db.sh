#!/bin/bash

echo "🚀 Initializing GATE COMPASS database..."

# Start PostgreSQL
echo "Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Create database
echo "Creating database..."
docker exec -it gate-compass-postgres psql -U postgres -c "CREATE DATABASE gatecompass;"

# Run migrations
echo "Running migrations..."
cd backend
npm run migrate

echo "✅ Database initialized successfully!"
echo "Now run: docker-compose up"
