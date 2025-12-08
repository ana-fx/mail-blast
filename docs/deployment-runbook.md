# Deployment Runbook
## Quick Reference Guide

**For:** DevOps Engineers  
**Purpose:** Step-by-step deployment execution guide

---

## Pre-Deployment Checklist

```bash
# 1. Verify code is ready
git checkout main
git pull
git log --oneline -5

# 2. Build and push images
cd backend && docker build -t mailblast-backend:v1.2.0 .
docker tag mailblast-backend:v1.2.0 registry.example.com/mailblast-backend:v1.2.0
docker push registry.example.com/mailblast-backend:v1.2.0

cd ../frontend && npm run build
docker build -t mailblast-frontend:v1.2.0 .
docker tag mailblast-frontend:v1.2.0 registry.example.com/mailblast-frontend:v1.2.0
docker push registry.example.com/mailblast-frontend:v1.2.0

# 3. Backup database
pg_dump -h db-host -U postgres mailblast > backup-$(date +%Y%m%d-%H%M%S).sql

# 4. Review migrations
ls -la backend/migrations/
```

---

## Deployment Steps

### Step 1: Deploy to Green

```bash
# Run deployment script
./scripts/deploy-green.sh v1.2.0 green

# Or manually:
docker-compose -f docker-compose.green.yml pull
docker-compose -f docker-compose.green.yml up -d
```

### Step 2: Run Smoke Tests

```bash
./scripts/smoke-tests-green.sh
```

### Step 3: Monitor Green Environment

```bash
# Check logs
docker logs green-backend --tail 50 -f

# Check metrics
curl http://green-backend:8081/metrics

# Check health
curl http://green-backend:8081/health
```

### Step 4: Switch Traffic (Gradual)

**10% Traffic:**
```nginx
upstream mailblast_backend {
    server blue-backend:8080 weight=90;
    server green-backend:8081 weight=10;
}
nginx -s reload
```

**Monitor for 5 minutes, then 50%:**
```nginx
upstream mailblast_backend {
    server blue-backend:8080 weight=50;
    server green-backend:8081 weight=50;
}
nginx -s reload
```

**Monitor for 10 minutes, then 100%:**
```nginx
upstream mailblast_backend {
    server blue-backend:8080 weight=0;
    server green-backend:8081 weight=100;
}
nginx -s reload
```

### Step 5: Post-Deployment Validation

```bash
# Verify functionality
curl http://green-backend:8081/api/campaigns -H "Authorization: Bearer $TOKEN"

# Check worker
docker logs green-worker --tail 20

# Monitor metrics
watch -n 5 'curl -s http://green-backend:8081/metrics | grep error_rate'
```

---

## Rollback Procedure

```bash
# Immediate rollback
./scripts/rollback.sh

# Or manually switch Nginx
# Update config to weight=100 for Blue, weight=0 for Green
nginx -s reload
```

---

## Emergency Contacts

- **DevOps On-Call:** [Phone/Email]
- **Development Lead:** [Phone/Email]
- **Database Admin:** [Phone/Email]

---

## Common Issues & Solutions

### Issue: Health check fails
**Solution:** Check logs, verify database connectivity, check environment variables

### Issue: Migrations fail
**Solution:** Review migration files, check database permissions, verify backup

### Issue: Workers not processing
**Solution:** Check Redis connectivity, verify worker logs, check queue depth

### Issue: High error rate after switch
**Solution:** Immediate rollback, investigate logs, check database connections

