#!/bin/bash

# Setup Automated Database Backups with Cron
# This script configures a cron job for automated daily backups

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="${SCRIPT_DIR}/backup-database.sh"

# Make backup script executable
chmod +x "${BACKUP_SCRIPT}"

# Default: Run backup daily at 2 AM
CRON_SCHEDULE="${CRON_SCHEDULE:-0 2 * * *}"

# Create cron job entry
CRON_JOB="${CRON_SCHEDULE} cd $(dirname ${SCRIPT_DIR}) && ${BACKUP_SCRIPT} >> /var/log/gate-compass-backup.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "${BACKUP_SCRIPT}"; then
    echo "Cron job for database backup already exists"
    echo "Current cron jobs:"
    crontab -l | grep "${BACKUP_SCRIPT}"
else
    # Add cron job
    (crontab -l 2>/dev/null; echo "${CRON_JOB}") | crontab -
    echo "Cron job added successfully!"
    echo "Schedule: ${CRON_SCHEDULE}"
    echo "Script: ${BACKUP_SCRIPT}"
fi

echo ""
echo "Current crontab:"
crontab -l

echo ""
echo "To remove the cron job, run:"
echo "crontab -e"
echo "and delete the line containing: ${BACKUP_SCRIPT}"
