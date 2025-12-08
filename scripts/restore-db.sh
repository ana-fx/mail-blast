#!/bin/bash
# Database Restore Script
#
# Usage: ./restore-db.sh [backup-file] [target-db]
#
# Example: ./restore-db.sh mailblast-full-20250115-020000.sql.gz mailblast

set -e

BACKUP_FILE="${1}"
TARGET_DB="${2:-mailblast}"
S3_BUCKET="s3://backups/mailblast/db/full/"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY}"

echo "=========================================="
echo "Database Restore Script"
echo "=========================================="

# Validate environment
if [ -z "$ENCRYPTION_KEY" ]; then
    echo "❌ Error: BACKUP_ENCRYPTION_KEY not set"
    exit 1
fi

# List available backups if no file specified
if [ -z "$BACKUP_FILE" ]; then
    echo "Available backups:"
    echo ""
    aws s3 ls "${S3_BUCKET}" | tail -10
    echo ""
    echo "Usage: $0 <backup-file> [target-db]"
    exit 1
fi

echo "Backup file: ${BACKUP_FILE}"
echo "Target database: ${TARGET_DB}"
echo "=========================================="
echo ""
echo "⚠️  WARNING: This will restore/overwrite database ${TARGET_DB}"
echo "⚠️  Make sure you have a current backup before proceeding!"
echo ""
read -p "Are you sure you want to continue? (yes/no) " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled"
    exit 0
fi

# Verify backup exists
echo ""
echo "🔍 Verifying backup exists..."
if ! aws s3 ls "${S3_BUCKET}${BACKUP_FILE}" > /dev/null 2>&1; then
    echo "❌ Error: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi
echo "✅ Backup file found"

# Test database connection
echo ""
echo "🔍 Testing database connection..."
if ! psql -h "${DB_HOST}" -U "${DB_USER}" -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Error: Cannot connect to database"
    exit 1
fi
echo "✅ Database connection OK"

# Drop and recreate database (optional - comment out if you want to restore into existing)
echo ""
read -p "Drop and recreate database ${TARGET_DB}? (yes/no) " -r
echo
if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "🗑️  Dropping database ${TARGET_DB}..."
    psql -h "${DB_HOST}" -U "${DB_USER}" -d postgres -c "DROP DATABASE IF EXISTS ${TARGET_DB};"
    echo "✅ Database dropped"
    
    echo "🆕 Creating database ${TARGET_DB}..."
    psql -h "${DB_HOST}" -U "${DB_USER}" -d postgres -c "CREATE DATABASE ${TARGET_DB};"
    echo "✅ Database created"
fi

# Restore backup
echo ""
echo "📥 Restoring backup..."
echo "   This may take several minutes..."

aws s3 cp "s3://backups/mailblast/db/full/${BACKUP_FILE}" - | \
  openssl enc -aes-256-cbc -d -k "${ENCRYPTION_KEY}" | \
  gunzip | \
  psql -h "${DB_HOST}" -U "${DB_USER}" -d "${TARGET_DB}"

if [ $? -eq 0 ]; then
    echo "✅ Database restore completed"
else
    echo "❌ Database restore failed!"
    exit 1
fi

# Verify restore
echo ""
echo "🔍 Verifying restore..."
TABLE_COUNT=$(psql -h "${DB_HOST}" -U "${DB_USER}" -d "${TARGET_DB}" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
CAMPAIGN_COUNT=$(psql -h "${DB_HOST}" -U "${DB_USER}" -d "${TARGET_DB}" -t -c "SELECT COUNT(*) FROM campaigns;" 2>/dev/null | xargs || echo "0")
EVENT_COUNT=$(psql -h "${DB_HOST}" -U "${DB_USER}" -d "${TARGET_DB}" -t -c "SELECT COUNT(*) FROM email_events;" 2>/dev/null | xargs || echo "0")

echo "   Tables: ${TABLE_COUNT}"
echo "   Campaigns: ${CAMPAIGN_COUNT}"
echo "   Email Events: ${EVENT_COUNT}"

echo ""
echo "=========================================="
echo "✅ Database restore completed successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Restore WAL archives if needed for point-in-time recovery"
echo "2. Verify application connectivity"
echo "3. Run smoke tests"
echo "4. Monitor system health"

