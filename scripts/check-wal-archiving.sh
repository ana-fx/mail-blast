#!/bin/bash
# Check WAL Archiving Status
#
# Usage: ./check-wal-archiving.sh
# Run via cron every 5 minutes

set -e

S3_BUCKET="s3://backups/mailblast/db/wal/"
THRESHOLD_MINUTES=20

echo "Checking WAL archiving status..."

# Get last WAL archive
LAST_WAL_INFO=$(aws s3 ls "${S3_BUCKET}" --recursive | sort | tail -1)

if [ -z "$LAST_WAL_INFO" ]; then
    echo "❌ Error: No WAL archives found"
    exit 1
fi

LAST_WAL_DATE_STR=$(echo "$LAST_WAL_INFO" | awk '{print $1" "$2}')
LAST_WAL_FILE=$(echo "$LAST_WAL_INFO" | awk '{print $4}')

if [ -z "$LAST_WAL_DATE_STR" ]; then
    echo "❌ Error: Cannot parse WAL archive date"
    exit 1
fi

# Calculate age
LAST_WAL_TIMESTAMP=$(date -d "$LAST_WAL_DATE_STR" +%s 2>/dev/null || echo "0")
CURRENT_TIMESTAMP=$(date +%s)
WAL_AGE_SECONDS=$((CURRENT_TIMESTAMP - LAST_WAL_TIMESTAMP))
WAL_AGE_MINUTES=$((WAL_AGE_SECONDS / 60))

if [ "$WAL_AGE_MINUTES" -gt "$THRESHOLD_MINUTES" ]; then
    echo "❌ WAL archiving delayed!"
    echo "   Last archive: ${LAST_WAL_FILE}"
    echo "   Age: ${WAL_AGE_MINUTES} minutes (threshold: ${THRESHOLD_MINUTES} minutes)"
    exit 1
else
    echo "✅ WAL archiving OK"
    echo "   Last archive: ${LAST_WAL_FILE}"
    echo "   Age: ${WAL_AGE_MINUTES} minutes"
    exit 0
fi

