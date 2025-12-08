#!/bin/bash

# Vegeta Benchmark: Tracking Endpoints
# 
# Usage:
#   export API_URL=http://localhost:8080
#   ./vegeta-tracking.sh

set -e

API_URL="${API_URL:-http://localhost:8080}"
RATE="${RATE:-5000}"  # requests per second
DURATION="${DURATION:-60s}"

echo "=========================================="
echo "Vegeta Tracking Endpoint Benchmark"
echo "=========================================="
echo "API URL: ${API_URL}"
echo "Rate: ${RATE} req/s"
echo "Duration: ${DURATION}"
echo "=========================================="

# Generate test targets
TARGETS_FILE=$(mktemp)
cat > "${TARGETS_FILE}" <<EOF
GET ${API_URL}/track/open/test-message-1
GET ${API_URL}/track/open/test-message-2
GET ${API_URL}/track/open/test-message-3
GET ${API_URL}/track/open/test-message-4
GET ${API_URL}/track/open/test-message-5
GET ${API_URL}/track/click/test-message-1?url=aHR0cHM6Ly9leGFtcGxlLmNvbQ==
GET ${API_URL}/track/click/test-message-2?url=aHR0cHM6Ly9leGFtcGxlLmNvbQ==
GET ${API_URL}/track/click/test-message-3?url=aHR0cHM6Ly9leGFtcGxlLmNvbQ==
EOF

echo "Running vegeta attack..."
echo ""

# Run vegeta attack and generate report
RESULTS_FILE=$(mktemp)
vegeta attack -rate="${RATE}" -duration="${DURATION}" -targets="${TARGETS_FILE}" > "${RESULTS_FILE}"

echo "=========================================="
echo "Results Summary"
echo "=========================================="
vegeta report "${RESULTS_FILE}"

echo ""
echo "=========================================="
echo "Latency Distribution"
echo "=========================================="
vegeta report -type=hist[0,10ms,50ms,100ms,200ms,500ms,1s,2s] "${RESULTS_FILE}"

# Generate plot
PLOT_FILE="/tmp/vegeta-plot-$(date +%s).html"
vegeta plot "${RESULTS_FILE}" > "${PLOT_FILE}"
echo ""
echo "Plot saved to: ${PLOT_FILE}"

# Cleanup
rm -f "${TARGETS_FILE}" "${RESULTS_FILE}"

echo ""
echo "Benchmark complete!"

