#!/bin/bash
# Retry Failed Jobs
#
# Usage: ./retry-failed-jobs.sh [hours]
#
# Retries jobs that failed in the last N hours (default: 24)

set -e

HOURS="${1:-24}"

echo "=========================================="
echo "Retry Failed Jobs"
echo "=========================================="
echo "Retrying jobs failed in last ${HOURS} hours"
echo "=========================================="

# Query failed jobs
FAILED_JOBS=$(psql -h "${DB_HOST}" -U "${DB_USER}" -d mailblast -t -c "
    SELECT id, campaign_id, error_message, created_at
    FROM failed_jobs
    WHERE created_at > NOW() - INTERVAL '${HOURS} hours'
    ORDER BY created_at DESC;
")

if [ -z "$FAILED_JOBS" ]; then
    echo "No failed jobs found in last ${HOURS} hours"
    exit 0
fi

echo ""
echo "Failed jobs to retry:"
echo "$FAILED_JOBS" | head -10

echo ""
read -p "Retry these jobs? (yes/no) " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Cancelled"
    exit 0
fi

# Retry each job
echo ""
echo "Retrying jobs..."

echo "$FAILED_JOBS" | while read -r line; do
    if [ -n "$line" ]; then
        JOB_ID=$(echo "$line" | awk '{print $1}')
        CAMPAIGN_ID=$(echo "$line" | awk '{print $2}')
        
        echo "  Retrying job ${JOB_ID} for campaign ${CAMPAIGN_ID}"
        
        # Re-queue job
        redis-cli LPUSH email_queue "{\"job_id\":\"${JOB_ID}\",\"campaign_id\":\"${CAMPAIGN_ID}\",\"type\":\"retry\"}" > /dev/null
        
        if [ $? -eq 0 ]; then
            # Mark as retried in database
            psql -h "${DB_HOST}" -U "${DB_USER}" -d mailblast -c "
                UPDATE failed_jobs 
                SET retried_at = NOW() 
                WHERE id = '${JOB_ID}';
            " > /dev/null
            
            echo "    ✅ Queued for retry"
        else
            echo "    ❌ Failed to queue"
        fi
    fi
done

echo ""
echo "=========================================="
echo "✅ Retry completed"
echo "=========================================="

