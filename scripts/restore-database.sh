#!/bin/bash

# Database Restore Script for GATE COMPASS
# This script restores a PostgreSQL database from a backup file

set -e

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh ./backups/gatecompass_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo "Error: Backup file '${BACKUP_FILE}' not found"
    exit 1
fi

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

echo "WARNING: This will replace the current database with the backup!"
echo "Backup file: ${BACKUP_FILE}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

echo "Starting database restore..."

# Create temporary directory for decompressed backup
TEMP_DIR=$(mktemp -d)
TEMP_SQL="${TEMP_DIR}/restore.sql"

# Decompress backup
echo "Decompressing backup..."
gunzip -c "${BACKUP_FILE}" > "${TEMP_SQL}"

# Stop backend to prevent connections
echo "Stopping backend service..."
docker-compose -f docker-compose.prod.yml stop backend

# Wait for connections to close
sleep 5

# Restore database
echo "Restoring database..."
docker-compose -f docker-compose.prod.yml exec -T postgres psql \
    -U "${DB_USER}" \
    -d postgres \
    < "${TEMP_SQL}"

# Clean up temporary files
rm -rf "${TEMP_DIR}"

# Start backend service
echo "Starting backend service..."
docker-compose -f docker-compose.prod.yml start backend

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
sleep 10

echo "Database restore completed successfully!"
echo "Please verify the application is working correctly."
