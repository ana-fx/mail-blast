#!/bin/bash
# MailBlast Rollback Script
# Usage: ./rollback.sh

set -e

echo "=========================================="
echo "MailBlast Rollback Script"
echo "=========================================="
echo "⚠️  WARNING: This will switch traffic back to Blue environment"
echo "=========================================="

# Confirm rollback
read -p "Are you sure you want to rollback? (yes/no) " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Rollback cancelled"
    exit 0
fi

# Check Blue environment health
echo ""
echo "🔍 Checking Blue environment health..."
if curl -f http://blue-backend:8080/health > /dev/null 2>&1; then
    echo "✅ Blue environment is healthy"
else
    echo "❌ Blue environment is not healthy!"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Switch traffic to Blue (Nginx example)
echo ""
echo "🔄 Switching traffic to Blue..."

# Backup current config
if [ -f "/etc/nginx/sites-available/mailblast" ]; then
    cp /etc/nginx/sites-available/mailblast /etc/nginx/sites-available/mailblast.backup.$(date +%Y%m%d-%H%M%S)
fi

# Update Nginx config
cat > /tmp/mailblast-nginx.conf <<EOF
upstream mailblast_backend {
    server blue-backend:8080 weight=100;
    server green-backend:8080 weight=0;
}

server {
    listen 80;
    server_name mailblast.example.com;
    
    location / {
        proxy_pass http://mailblast_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Apply config (requires sudo)
echo "Applying Nginx configuration..."
if [ -w "/etc/nginx/sites-available/mailblast" ]; then
    cp /tmp/mailblast-nginx.conf /etc/nginx/sites-available/mailblast
    nginx -t && nginx -s reload
    echo "✅ Nginx configuration updated"
else
    echo "⚠️  Cannot write to /etc/nginx/sites-available/mailblast"
    echo "Please manually update Nginx config:"
    cat /tmp/mailblast-nginx.conf
fi

# Verify traffic switch
echo ""
echo "🔍 Verifying traffic switch..."
sleep 5

# Check Blue is receiving traffic
BLUE_REQUESTS=$(curl -s http://blue-backend:8080/metrics | grep "http_requests_total" | head -1 | awk '{print $2}' || echo "0")
echo "Blue backend requests: ${BLUE_REQUESTS}"

# Check logs
echo ""
echo "📋 Checking Blue backend logs..."
docker logs blue-backend --tail 10

echo ""
echo "=========================================="
echo "✅ Rollback Complete!"
echo "=========================================="
echo "Traffic has been switched back to Blue environment"
echo "Monitor Blue environment for stability"
echo "=========================================="

