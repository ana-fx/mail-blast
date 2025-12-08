#!/bin/bash
# MailBlast Green Environment Deployment Script
# Usage: ./deploy-green.sh [version] [environment]

set -e

VERSION="${1:-latest}"
ENV="${2:-green}"

echo "=========================================="
echo "MailBlast Deployment Script"
echo "=========================================="
echo "Version: ${VERSION}"
echo "Environment: ${ENV}"
echo "=========================================="

# Validate version
if [ "$VERSION" == "latest" ]; then
    echo "⚠️  Warning: Using 'latest' tag. Specify version for production."
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Pull images
echo ""
echo "📥 Pulling Docker images..."
docker pull registry.example.com/mailblast-backend:${VERSION} || {
    echo "❌ Failed to pull backend image"
    exit 1
}
docker pull registry.example.com/mailblast-frontend:${VERSION} || {
    echo "❌ Failed to pull frontend image"
    exit 1
}
docker pull registry.example.com/mailblast-worker:${VERSION} || {
    echo "❌ Failed to pull worker image"
    exit 1
}
echo "✅ Images pulled successfully"

# Verify images
echo ""
echo "🔍 Verifying images..."
docker images | grep "${VERSION}" || {
    echo "❌ Images not found"
    exit 1
}

# Run migrations (dry-run first)
echo ""
echo "🗄️  Running database migrations..."
if [ -f "./migrate" ]; then
    echo "Running dry-run..."
    ./migrate -path migrations -database "$DATABASE_URL" -dry-run up || {
        echo "⚠️  Dry-run failed, but continuing..."
    }
    
    echo "Applying migrations..."
    ./migrate -path migrations -database "$DATABASE_URL" up || {
        echo "❌ Migration failed"
        exit 1
    }
    echo "✅ Migrations applied"
else
    echo "⚠️  Migrate tool not found, skipping migrations"
fi

# Deploy containers
echo ""
echo "🐳 Deploying containers..."
docker-compose -f docker-compose.${ENV}.yml down || true
docker-compose -f docker-compose.${ENV}.yml up -d || {
    echo "❌ Container deployment failed"
    exit 1
}

# Wait for containers to start
echo ""
echo "⏳ Waiting for containers to start..."
sleep 15

# Verify containers
echo ""
echo "🔍 Verifying containers..."
docker-compose -f docker-compose.${ENV}.yml ps

# Health checks
echo ""
echo "🏥 Running health checks..."
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        echo "✅ Health check passed"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "⏳ Waiting for health check... (${RETRY_COUNT}/${MAX_RETRIES})"
    sleep 5
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Health check failed after ${MAX_RETRIES} retries"
    exit 1
fi

# Readiness check
echo ""
echo "🔍 Running readiness check..."
if curl -f http://localhost:8080/health/ready > /dev/null 2>&1; then
    echo "✅ Readiness check passed"
else
    echo "⚠️  Readiness check failed, but continuing..."
fi

# Check logs for errors
echo ""
echo "📋 Checking logs for errors..."
ERROR_COUNT=$(docker logs ${ENV}-backend --tail 50 2>&1 | grep -i error | wc -l || echo "0")
if [ "$ERROR_COUNT" -gt 5 ]; then
    echo "⚠️  Warning: Found ${ERROR_COUNT} errors in logs"
    docker logs ${ENV}-backend --tail 20 | grep -i error
else
    echo "✅ No critical errors in logs"
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo "Next steps:"
echo "1. Run smoke tests: ./scripts/smoke-tests-${ENV}.sh"
echo "2. Monitor metrics: http://localhost:8080/metrics"
echo "3. Check logs: docker logs ${ENV}-backend"
echo "4. Switch traffic when ready"
echo "=========================================="

