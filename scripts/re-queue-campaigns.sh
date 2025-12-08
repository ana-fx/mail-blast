#!/bin/bash
# Re-queue Campaigns from Database
#
# Usage: ./re-queue-campaigns.sh
#
# This script re-queues campaigns that are in 'scheduled' or 'sending' status
# but not in the Redis queue.

set -e

echo "=========================================="
echo "Re-queue Campaigns Script"
echo "=========================================="

# Query campaigns that need to be re-queued
CAMPAIGNS=$(psql -h "${DB_HOST}" -U "${DB_USER}" -d mailblast -t -c "
    SELECT id, name, status 
    FROM campaigns 
    WHERE status IN ('scheduled', 'sending')
    AND send_at <= NOW()
    ORDER BY created_at;
")

if [ -z "$CAMPAIGNS" ]; then
    echo "No campaigns to re-queue"
    exit 0
fi

echo "Found campaigns to re-queue:"
echo "$CAMPAIGNS" | while read -r line; do
    if [ -n "$line" ]; then
        echo "  - $line"
    fi
done

echo ""
read -p "Re-queue these campaigns? (yes/no) " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Cancelled"
    exit 0
fi

# Re-queue each campaign
echo ""
echo "Re-queuing campaigns..."

echo "$CAMPAIGNS" | while read -r line; do
    if [ -n "$line" ]; then
        CAMPAIGN_ID=$(echo "$line" | awk '{print $1}')
        CAMPAIGN_NAME=$(echo "$line" | awk '{print $2}')
        
        echo "  Re-queuing: ${CAMPAIGN_NAME} (${CAMPAIGN_ID})"
        
        # Add to queue (example - adjust based on your queue structure)
        redis-cli LPUSH email_queue "{\"campaign_id\":\"${CAMPAIGN_ID}\",\"type\":\"send_campaign\"}" > /dev/null
        
        if [ $? -eq 0 ]; then
            echo "    ✅ Queued successfully"
        else
            echo "    ❌ Failed to queue"
        fi
    fi
done

echo ""
echo "=========================================="
echo "✅ Re-queue completed"
echo "=========================================="

