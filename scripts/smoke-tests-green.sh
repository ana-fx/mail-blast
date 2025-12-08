#!/bin/bash
# Smoke Tests for Green Environment
# Usage: ./smoke-tests-green.sh

set -e

GREEN_URL="${GREEN_URL:-http://green-backend:8080}"
TOKEN="${TEST_TOKEN:-}"

echo "=========================================="
echo "Smoke Tests - Green Environment"
echo "=========================================="
echo "Testing: ${GREEN_URL}"
echo "=========================================="

FAILED=0

# Test 1: Health Check
echo ""
echo "Test 1: Health Check"
if curl -f -s "${GREEN_URL}/health" > /dev/null; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    FAILED=$((FAILED + 1))
fi

# Test 2: Readiness Check
echo ""
echo "Test 2: Readiness Check"
if curl -f -s "${GREEN_URL}/health/ready" > /dev/null; then
    echo "✅ Readiness check passed"
else
    echo "❌ Readiness check failed"
    FAILED=$((FAILED + 1))
fi

# Test 3: Liveness Check
echo ""
echo "Test 3: Liveness Check"
if curl -f -s "${GREEN_URL}/health/live" > /dev/null; then
    echo "✅ Liveness check passed"
else
    echo "❌ Liveness check failed"
    FAILED=$((FAILED + 1))
fi

# Test 4: Metrics Endpoint
echo ""
echo "Test 4: Metrics Endpoint"
if curl -f -s "${GREEN_URL}/metrics" > /dev/null; then
    echo "✅ Metrics endpoint accessible"
else
    echo "❌ Metrics endpoint failed"
    FAILED=$((FAILED + 1))
fi

# Test 5: API Endpoint (if token provided)
if [ -n "$TOKEN" ]; then
    echo ""
    echo "Test 5: API Endpoint"
    if curl -f -s -H "Authorization: Bearer ${TOKEN}" "${GREEN_URL}/api/campaigns" > /dev/null; then
        echo "✅ API endpoint accessible"
    else
        echo "❌ API endpoint failed"
        FAILED=$((FAILED + 1))
    fi
else
    echo ""
    echo "Test 5: API Endpoint (skipped - no token)"
fi

# Test 6: Tracking - Open
echo ""
echo "Test 6: Tracking - Open"
if curl -f -s -I "${GREEN_URL}/track/open/test-smoke-$(date +%s)" | grep -q "200\|302"; then
    echo "✅ Open tracking works"
else
    echo "❌ Open tracking failed"
    FAILED=$((FAILED + 1))
fi

# Test 7: Tracking - Click
echo ""
echo "Test 7: Tracking - Click"
ENCODED_URL=$(echo -n "https://example.com" | base64)
if curl -f -s -I "${GREEN_URL}/track/click/test-smoke-$(date +%s)?url=${ENCODED_URL}" | grep -q "200\|302"; then
    echo "✅ Click tracking works"
else
    echo "❌ Click tracking failed"
    FAILED=$((FAILED + 1))
fi

# Summary
echo ""
echo "=========================================="
if [ $FAILED -eq 0 ]; then
    echo "✅ All smoke tests passed!"
    echo "=========================================="
    exit 0
else
    echo "❌ ${FAILED} smoke test(s) failed"
    echo "=========================================="
    exit 1
fi

