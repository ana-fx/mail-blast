#!/bin/bash
# Replay SNS Events from Dead Letter Queue
#
# Usage: ./replay-sns-events.sh

set -e

DLQ_URL="${DLQ_URL:-https://sqs.us-east-1.amazonaws.com/123456789/mailblast-dlq}"
WEBHOOK_URL="${WEBHOOK_URL:-https://mailblast.example.com/api/webhooks/sns}"
MAX_MESSAGES=10

echo "=========================================="
echo "SNS Events Replay from DLQ"
echo "=========================================="
echo "DLQ: ${DLQ_URL}"
echo "Webhook: ${WEBHOOK_URL}"
echo "=========================================="

# Check DLQ message count
MESSAGE_COUNT=$(aws sqs get-queue-attributes \
  --queue-url "${DLQ_URL}" \
  --attribute-names ApproximateNumberOfMessages \
  --query 'Attributes.ApproximateNumberOfMessages' \
  --output text)

echo ""
echo "Messages in DLQ: ${MESSAGE_COUNT}"

if [ "$MESSAGE_COUNT" -eq 0 ]; then
    echo "✅ No messages to replay"
    exit 0
fi

# Process messages
PROCESSED=0
FAILED=0

while [ $PROCESSED -lt $MESSAGE_COUNT ] && [ $PROCESSED -lt 100 ]; do
    echo ""
    echo "Processing batch ${PROCESSED}..."
    
    # Receive messages
    RESPONSE=$(aws sqs receive-message \
      --queue-url "${DLQ_URL}" \
      --max-number-of-messages "${MAX_MESSAGES}" \
      --wait-time-seconds 5)
    
    if [ -z "$RESPONSE" ] || [ "$RESPONSE" == "null" ]; then
        echo "No more messages"
        break
    fi
    
    # Process each message
    echo "$RESPONSE" | jq -r '.Messages[]? | @json' | while read -r message; do
        RECEIPT_HANDLE=$(echo "$message" | jq -r '.ReceiptHandle')
        BODY=$(echo "$message" | jq -r '.Body')
        
        # Extract SNS message
        SNS_MESSAGE=$(echo "$BODY" | jq -r '.Message // .')
        MESSAGE_ID=$(echo "$BODY" | jq -r '.MessageId // empty')
        
        if [ -z "$SNS_MESSAGE" ]; then
            SNS_MESSAGE="$BODY"
        fi
        
        echo "  Replaying message: ${MESSAGE_ID}"
        
        # Replay to webhook
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
          -X POST "${WEBHOOK_URL}" \
          -H "Content-Type: application/json" \
          -H "x-amz-sns-message-type: Notification" \
          -d "$SNS_MESSAGE")
        
        if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
            echo "    ✅ Replayed successfully (HTTP ${HTTP_CODE})"
            
            # Delete message from DLQ
            aws sqs delete-message \
              --queue-url "${DLQ_URL}" \
              --receipt-handle "${RECEIPT_HANDLE}" > /dev/null 2>&1
            
            PROCESSED=$((PROCESSED + 1))
        else
            echo "    ❌ Replay failed (HTTP ${HTTP_CODE})"
            FAILED=$((FAILED + 1))
        fi
    done
    
    sleep 1
done

echo ""
echo "=========================================="
echo "Replay Summary"
echo "=========================================="
echo "Processed: ${PROCESSED}"
echo "Failed: ${FAILED}"
echo "=========================================="

if [ $FAILED -gt 0 ]; then
    exit 1
fi

