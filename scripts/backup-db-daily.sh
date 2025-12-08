#!/bin/bash
# Daily Database Backup Script
# 
# Usage: Run via cron daily at 02:00 UTC
# 0 2 * * * /path/to/backup-db-daily.sh
#
# Environment variables required:
# - DB_HOST: PostgreSQL host
# - DB_USER: PostgreSQL user
# - BACKUP_ENCRYPTION_KEY: Encryption key for backups
# - AWS_ACCESS_KEY_ID: AWS credentials
# - AWS_SECRET_ACCESS_KEY: AWS credentials

set -e

DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="mailblast-full-${DATE}.sql.gz"
S3_BUCKET="s3://backups/mailblast/db/full/"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY}"
RETENTION_DAYS=30

echo "=========================================="
echo "Daily Database Backup"
echo "=========================================="
echo "Date: ${DATE}"
echo "Backup file: ${BACKUP_FILE}"
echo "=========================================="

# Validate environment
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$ENCRYPTION_KEY" ]; then
    echo "❌ Error: Required environment variables not set"
    exit 1
fi

# Test database connection
if ! psql -h "${DB_HOST}" -U "${DB_USER}" -d mailblast -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Error: Cannot connect to database"
    exit 1
fi

echo ""
echo "📥 Creating database backup..."

# Full backup with compression and encryption
pg_dump -h "${DB_HOST}" -U "${DB_USER}" -d mailblast \
  --no-owner \
  --no-acl \
  --verbose 2>&1 | \
  gzip | \
  openssl enc -aes-256-cbc -salt -k "${ENCRYPTION_KEY}" | \
  aws s3 cp - "${S3_BUCKET}${BACKUP_FILE}" \
  --storage-class STANDARD_IA

if [ $? -ne 0 ]; then
    echo "❌ Backup failed!"
    exit 1
fi

# Verify backup
echo ""
echo "🔍 Verifying backup..."
if aws s3 ls "${S3_BUCKET}${BACKUP_FILE}" > /dev/null 2>&1; then
    BACKUP_SIZE=$(aws s3 ls "${S3_BUCKET}${BACKUP_FILE}" | awk '{print $3}')
    BACKUP_SIZE_MB=$((BACKUP_SIZE / 1024 / 1024))
    echo "✅ Backup verified: ${BACKUP_FILE}"
    echo "   Size: ${BACKUP_SIZE_MB} MB"
else
    echo "❌ Backup verification failed!"
    exit 1
fi

# Cleanup old backups
echo ""
echo "🧹 Cleaning up old backups (keeping ${RETENTION_DAYS} days)..."
CUTOFF_DATE=$(date -d "${RETENTION_DAYS} days ago" +%s)

aws s3 ls "${S3_BUCKET}" | while read -r line; do
    BACKUP_DATE_STR=$(echo "$line" | awk '{print $1" "$2}')
    BACKUP_NAME=$(echo "$line" | awk '{print $4}')
    
    if [ -n "$BACKUP_NAME" ] && [ -n "$BACKUP_DATE_STR" ]; then
        BACKUP_DATE=$(date -d "$BACKUP_DATE_STR" +%s 2>/dev/null || echo "0")
        if [ "$BACKUP_DATE" -lt "$CUTOFF_DATE" ] && [ "$BACKUP_DATE" -gt 0 ]; then
            echo "   Deleting old backup: ${BACKUP_NAME}"
            aws s3 rm "${S3_BUCKET}${BACKUP_NAME}"
        fi
    fi
done

echo ""
echo "=========================================="
echo "✅ Daily backup completed successfully!"
echo "=========================================="

