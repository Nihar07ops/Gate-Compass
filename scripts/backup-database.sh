#!/bin/bash

# Database Backup Script for GATE COMPASS
# This script creates a backup of the PostgreSQL database

set -e

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/gatecompass_backup_${TIMESTAMP}.sql"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "Starting database backup..."
echo "Backup file: ${BACKUP_FILE}"

# Create backup using pg_dump
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --clean \
    --if-exists \
    --create \
    --format=plain \
    > "${BACKUP_FILE}"

# Compress the backup
gzip "${BACKUP_FILE}"
BACKUP_FILE="${BACKUP_FILE}.gz"

echo "Backup completed: ${BACKUP_FILE}"

# Calculate backup size
BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "Backup size: ${BACKUP_SIZE}"

# Remove old backups (older than RETENTION_DAYS)
echo "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
find "${BACKUP_DIR}" -name "gatecompass_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

# List remaining backups
echo "Current backups:"
ls -lh "${BACKUP_DIR}"/gatecompass_backup_*.sql.gz 2>/dev/null || echo "No backups found"

# Optional: Upload to S3 or cloud storage
if [ -n "${AWS_S3_BUCKET}" ]; then
    echo "Uploading backup to S3..."
    aws s3 cp "${BACKUP_FILE}" "s3://${AWS_S3_BUCKET}/backups/" --storage-class STANDARD_IA
    echo "Backup uploaded to S3"
fi

echo "Backup process completed successfully!"
