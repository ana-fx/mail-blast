# Production Rollout Plan
## Blue-Green Deployment Strategy

**Version:** 1.0  
**Date:** 2025-01-XX  
**Prepared By:** Senior DevOps Architect  
**Status:** Ready for Production Deployment

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Deployment Flow](#2-deployment-flow)
3. [Database Migration Strategy](#3-database-migration-strategy)
4. [Rollback Plan](#4-rollback-plan)
5. [Monitoring & Alerting](#5-monitoring--alerting)
6. [Release Checklist](#6-release-checklist)
7. [Final Release Sign-off](#7-final-release-sign-off)

---

## 1. Architecture Overview

### 1.1 Blue-Green Deployment Concept

Blue-Green deployment maintains two identical production environments:

- **Blue Environment:** Current production (live traffic)
- **Green Environment:** New version (staging for validation)

Traffic is switched from Blue to Green after validation, enabling zero-downtime deployments.

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Load Balancer                            │
│                    (Nginx / AWS ALB)                            │
│                                                                 │
│  Traffic Switch: Blue ←→ Green                                  │
└──────────────┬───────────────────────┬───────────────────────────┘
               │                       │
               │                       │
    ┌──────────▼──────────┐  ┌────────▼──────────┐
    │   BLUE Environment  │  │  GREEN Environment│
    │   (Current Live)    │  │  (New Version)    │
    ├─────────────────────┤  ├───────────────────┤
    │                     │  │                   │
    │  ┌──────────────┐   │  │  ┌──────────────┐ │
    │  │  Frontend    │   │  │  │  Frontend    │ │
    │  │  (Next.js)   │   │  │  │  (Next.js)   │ │
    │  └──────┬───────┘   │  │  └──────┬───────┘ │
    │         │           │  │         │         │
    │  ┌──────▼───────┐   │  │  ┌──────▼───────┐ │
    │  │  Backend API │   │  │  │  Backend API │ │
    │  │  (Go)        │   │  │  │  (Go)        │ │
    │  └──────┬───────┘   │  │  └──────┬───────┘ │
    │         │           │  │         │         │
    │  ┌──────▼───────┐   │  │  ┌──────▼───────┐ │
    │  │  Workers     │   │  │  │  Workers     │ │
    │  │  (Email Send)│   │  │  │  (Email Send)│ │
    │  └──────┬───────┘   │  │  └──────┬───────┘ │
    │         │           │  │         │         │
    └─────────┼───────────┘  └─────────┼─────────┘
              │                        │
              │                        │
    ┌─────────▼───────────────────────▼──────────┐
    │         Shared Infrastructure               │
    │                                             │
    │  ┌──────────────┐  ┌──────────────┐        │
    │  │  PostgreSQL  │  │    Redis     │        │
    │  │  (Database)  │  │   (Queue)    │        │
    │  └──────────────┘  └──────────────┘        │
    │                                             │
    │  ┌──────────────┐  ┌──────────────┐        │
    │  │   AWS SES    │  │   SNS        │        │
    │  │  (SMTP)      │  │  (Webhooks)  │        │
    │  └──────────────┘  └──────────────┘        │
    └─────────────────────────────────────────────┘
```

### 1.3 Traffic Switch Mechanism

**Load Balancer Configuration:**

```nginx
# Nginx Configuration Example
upstream mailblast_backend {
    # Blue (current)
    server blue-backend:8080 weight=100;
    # Green (new) - initially weight=0
    server green-backend:8080 weight=0;
}

server {
    location / {
        proxy_pass http://mailblast_backend;
    }
}
```

**Traffic Switch Process:**
1. Deploy Green with weight=0 (no traffic)
2. Validate Green environment
3. Gradually increase Green weight (10% → 50% → 100%)
4. Monitor metrics during switch
5. Complete switch to Green (Blue weight=0)
6. Keep Blue idle for rollback window

### 1.4 Health Check Endpoints

**Backend Health Checks:**

| Endpoint | Purpose | Expected Response |
|----------|---------|------------------|
| `/health` | Basic health | `{"status":"healthy"}` |
| `/health/ready` | Readiness check | `{"status":"ready","db":"connected"}` |
| `/health/live` | Liveness check | `{"status":"alive"}` |
| `/metrics` | Prometheus metrics | Metrics in Prometheus format |

**Frontend Health Check:**
- Root endpoint returns 200 OK
- Static assets loadable
- API connectivity verified

### 1.5 Worker Deployment Strategy

**Worker Deployment:**
- Workers run in both Blue and Green environments
- Workers consume from shared Redis queue
- Both environments process jobs during transition
- Workers scale independently per environment

**Queue Management:**
- Single Redis queue shared by both environments
- Job format is backward-compatible
- Workers from both environments can process same jobs
- No job duplication during switch

### 1.6 Tracking Endpoints Zero-Downtime

**Strategy:**
- Tracking endpoints (`/track/open/*`, `/track/click/*`) are stateless
- No database writes required for basic tracking
- Both Blue and Green can handle tracking requests
- Load balancer distributes tracking traffic to both

**Implementation:**
- Tracking endpoints work in both environments
- Database writes are idempotent
- No session state required
- Graceful degradation if one environment fails

---

## 2. Deployment Flow

### Phase A: Pre-Deployment

#### A.1 Build Pipeline

**Steps:**
1. **Code Merge:**
   - [ ] All code merged to `main` branch
   - [ ] Code review approved
   - [ ] All tests passing in CI

2. **Backend Build:**
   ```bash
   # Build Docker image
   docker build -t mailblast-backend:v1.2.0 -f backend/Dockerfile .
   # Tag for registry
   docker tag mailblast-backend:v1.2.0 registry.example.com/mailblast-backend:v1.2.0
   # Push to registry
   docker push registry.example.com/mailblast-backend:v1.2.0
   ```

3. **Frontend Build:**
   ```bash
   # Build Next.js
   cd frontend
   npm run build
   # Build Docker image
   docker build -t mailblast-frontend:v1.2.0 -f Dockerfile .
   # Tag and push
   docker tag mailblast-frontend:v1.2.0 registry.example.com/mailblast-frontend:v1.2.0
   docker push registry.example.com/mailblast-frontend:v1.2.0
   ```

4. **Worker Build:**
   ```bash
   # Build worker image
   docker build -t mailblast-worker:v1.2.0 -f backend/Dockerfile.worker .
   docker tag mailblast-worker:v1.2.0 registry.example.com/mailblast-worker:v1.2.0
   docker push registry.example.com/mailblast-worker:v1.2.0
   ```

**Validation:**
- [ ] All images built successfully
- [ ] Images pushed to registry
- [ ] Image tags verified
- [ ] Image sizes within limits

#### A.2 Test Execution

**Automated Tests:**
- [ ] Unit tests pass (backend + frontend)
- [ ] Integration tests pass
- [ ] E2E tests pass (Playwright)
- [ ] Performance tests pass (k6)

**Manual Validation:**
- [ ] QA sign-off obtained
- [ ] UAT completed (if applicable)
- [ ] Security scan passed

#### A.3 Security Checks

**Security Validation:**
- [ ] Dependency vulnerability scan
- [ ] Container image scan
- [ ] Secrets not hardcoded
- [ ] Environment variables validated
- [ ] SSL/TLS certificates valid
- [ ] Firewall rules reviewed

#### A.4 Environment Preparation

**Green Environment Setup:**
- [ ] Green environment provisioned
- [ ] Network configuration applied
- [ ] Environment variables set
- [ ] Secrets configured
- [ ] SSL certificates installed
- [ ] Load balancer configured (weight=0)

#### A.5 Database Backup Plan

**Backup Strategy:**
```bash
# Full database backup before deployment
pg_dump -h db-host -U postgres mailblast > backup-pre-deploy-$(date +%Y%m%d-%H%M%S).sql

# Verify backup
ls -lh backup-pre-deploy-*.sql

# Store backup in safe location
aws s3 cp backup-pre-deploy-*.sql s3://backups/mailblast/
```

**Backup Checklist:**
- [ ] Full database backup completed
- [ ] Backup verified (size, integrity)
- [ ] Backup stored in secure location
- [ ] Backup retention policy confirmed
- [ ] Point-in-time recovery tested (if applicable)

---

### Phase B: Deploy to GREEN

#### B.1 Pull New Image

**Steps:**
```bash
# On Green environment server
docker pull registry.example.com/mailblast-backend:v1.2.0
docker pull registry.example.com/mailblast-frontend:v1.2.0
docker pull registry.example.com/mailblast-worker:v1.2.0

# Verify images
docker images | grep v1.2.0
```

**Validation:**
- [ ] All images pulled successfully
- [ ] Image versions correct
- [ ] No image pull errors

#### B.2 Apply Migrations Safely

**Migration Process:**
```bash
# Run migrations in dry-run mode first
./migrate -path migrations -database "$DATABASE_URL" -dry-run up

# Apply migrations
./migrate -path migrations -database "$DATABASE_URL" up

# Verify migration status
./migrate -path migrations -database "$DATABASE_URL" version
```

**Migration Checklist:**
- [ ] Migrations reviewed for safety
- [ ] Backward-compatible changes verified
- [ ] Dry-run completed successfully
- [ ] Migrations applied
- [ ] Migration version verified
- [ ] No migration errors

**Zero-Downtime Migration Rules:**
- ✅ Add columns as NULL first
- ✅ Add indexes concurrently
- ✅ Avoid DROP/RENAME until next deploy
- ✅ Use feature flags for new features
- ✅ Migrate data in batches

#### B.3 Deploy Containers

**Backend Deployment:**
```bash
# Stop old containers (if any)
docker-compose -f docker-compose.green.yml down

# Start new containers
docker-compose -f docker-compose.green.yml up -d

# Verify containers running
docker-compose -f docker-compose.green.yml ps
```

**Frontend Deployment:**
```bash
# Deploy frontend
docker-compose -f docker-compose.green.yml up -d frontend

# Verify frontend
curl -I http://green-frontend:3000
```

**Worker Deployment:**
```bash
# Deploy workers
docker-compose -f docker-compose.green.yml up -d worker

# Scale workers if needed
docker-compose -f docker-compose.green.yml up -d --scale worker=3
```

**Validation:**
- [ ] All containers running
- [ ] No container crashes
- [ ] Container logs show no errors
- [ ] Resource usage normal

#### B.4 Run Smoke Tests

**Smoke Test Script:**
```bash
#!/bin/bash
# smoke-tests-green.sh

GREEN_URL="http://green-backend:8080"

# Health check
curl -f "$GREEN_URL/health" || exit 1

# Readiness check
curl -f "$GREEN_URL/health/ready" || exit 1

# API endpoint test
curl -f "$GREEN_URL/api/campaigns" -H "Authorization: Bearer $TEST_TOKEN" || exit 1

# Tracking endpoint test
curl -f "$GREEN_URL/track/open/test-message-123" || exit 1

echo "✅ All smoke tests passed"
```

**Smoke Test Checklist:**
- [ ] Health endpoint responds
- [ ] Readiness endpoint responds
- [ ] API endpoints accessible
- [ ] Authentication works
- [ ] Tracking endpoints respond
- [ ] Database connectivity verified
- [ ] Redis connectivity verified

#### B.5 Validate Logs & Metrics

**Log Validation:**
```bash
# Check backend logs
docker logs green-backend --tail 100 | grep -i error

# Check worker logs
docker logs green-worker --tail 100 | grep -i error

# Check frontend logs
docker logs green-frontend --tail 100 | grep -i error
```

**Metrics Validation:**
- [ ] Prometheus metrics endpoint accessible
- [ ] Metrics being collected
- [ ] No error metrics spikes
- [ ] Response time metrics normal
- [ ] Worker metrics showing activity

**Validation Checklist:**
- [ ] No critical errors in logs
- [ ] Metrics collection working
- [ ] Error rate < 0.1%
- [ ] Response times normal
- [ ] Worker processing jobs

#### B.6 Ensure Workers Consume Jobs

**Worker Validation:**
```bash
# Check worker is processing jobs
docker logs green-worker | grep "Processing job"

# Check queue depth
redis-cli LLEN email_queue

# Verify worker metrics
curl http://green-backend:8080/metrics | grep worker_throughput
```

**Validation:**
- [ ] Workers connected to Redis
- [ ] Workers processing jobs
- [ ] Queue depth decreasing
- [ ] No worker errors
- [ ] Throughput acceptable

#### B.7 Ensure Emails Queue and Send

**Email Sending Test:**
1. Create test campaign in Green environment
2. Queue campaign for sending
3. Monitor queue status
4. Verify emails are sent
5. Check SES delivery status

**Validation:**
- [ ] Campaigns can be queued
- [ ] Jobs appear in queue
- [ ] Workers pick up jobs
- [ ] Emails sent successfully
- [ ] SES responses received
- [ ] Delivery events logged

#### B.8 Ensure Tracking Endpoints Respond

**Tracking Validation:**
```bash
# Test open tracking
curl -I "http://green-backend:8080/track/open/test-123"

# Test click tracking
curl -I "http://green-backend:8080/track/click/test-123?url=aHR0cHM6Ly9leGFtcGxlLmNvbQ=="
```

**Validation:**
- [ ] Open tracking responds (200 or 302)
- [ ] Click tracking redirects correctly
- [ ] Tracking events logged
- [ ] No tracking errors
- [ ] Response time < 50ms

---

### Phase C: Traffic Switchover

#### C.1 ALB / Nginx Route: Green → Live

**Gradual Traffic Switch:**

**Step 1: 10% Traffic to Green**
```nginx
upstream mailblast_backend {
    server blue-backend:8080 weight=90;
    server green-backend:8080 weight=10;
}
```
- [ ] Apply configuration
- [ ] Monitor for 5 minutes
- [ ] Verify no errors

**Step 2: 50% Traffic to Green**
```nginx
upstream mailblast_backend {
    server blue-backend:8080 weight=50;
    server green-backend:8080 weight=50;
}
```
- [ ] Apply configuration
- [ ] Monitor for 10 minutes
- [ ] Verify metrics stable

**Step 3: 100% Traffic to Green**
```nginx
upstream mailblast_backend {
    server blue-backend:8080 weight=0;
    server green-backend:8080 weight=100;
}
```
- [ ] Apply configuration
- [ ] Monitor for 15 minutes
- [ ] Verify all traffic on Green

#### C.2 Monitoring During Switch

**Key Metrics to Monitor:**

| Metric | Threshold | Action if Exceeded |
|--------|-----------|-------------------|
| Error Rate | < 0.1% | Pause switch, investigate |
| p95 Latency | < 200ms | Pause switch, investigate |
| p99 Latency | < 500ms | Pause switch, investigate |
| 5xx Errors | 0 | Immediate rollback |
| Worker Lag | < 1000 jobs | Pause switch, investigate |
| Database Connections | < 80% | Monitor closely |
| Memory Usage | < 80% | Monitor closely |
| CPU Usage | < 80% | Monitor closely |

**Monitoring Dashboard:**
- Real-time error rate graph
- Response time percentiles
- Queue depth monitoring
- Worker throughput
- Database connection pool
- System resources (CPU, RAM)

#### C.3 Rollback Criteria

**Immediate Rollback Triggers:**
- [ ] Error rate > 1% for 2 minutes
- [ ] p95 latency > 2s for 2 minutes
- [ ] 5xx errors detected
- [ ] Database connection failures
- [ ] Worker crashes
- [ ] Critical functionality broken
- [ ] Data corruption detected
- [ ] Security vulnerability exposed

**Rollback Decision:**
- If any trigger occurs → Execute rollback plan (see Section 4)
- Rollback must complete within 10 seconds

---

### Phase D: Post-Deployment

#### D.1 Mark Previous Blue Idle

**After Successful Switch:**
```bash
# Stop Blue environment (keep for rollback window)
docker-compose -f docker-compose.blue.yml stop

# Or reduce Blue to minimal resources
docker-compose -f docker-compose.blue.yml scale backend=0 worker=0
```

**Blue Environment Status:**
- [ ] Blue marked as idle
- [ ] Blue kept available for rollback (24-48 hours)
- [ ] Blue resources reduced (cost optimization)
- [ ] Blue can be destroyed after rollback window

#### D.2 Cleanup Strategy

**Immediate Cleanup (After 24 hours):**
- [ ] Old Docker images removed
- [ ] Unused containers stopped
- [ ] Temporary files cleaned
- [ ] Log files rotated

**After Rollback Window (48 hours):**
- [ ] Blue environment destroyed
- [ ] Old images purged from registry
- [ ] Backup files archived
- [ ] Deployment artifacts cleaned

#### D.3 Post-Deploy Validation Checklist

**Functional Validation:**
- [ ] All critical features working
- [ ] Campaign creation works
- [ ] Email sending works
- [ ] Tracking works
- [ ] Analytics accurate
- [ ] Settings accessible
- [ ] User management works (Admin)

**Performance Validation:**
- [ ] Response times within targets
- [ ] No performance degradation
- [ ] Queue processing normal
- [ ] Worker throughput acceptable
- [ ] Database performance stable

**Monitoring Validation:**
- [ ] All metrics collecting
- [ ] Alerts configured correctly
- [ ] Dashboards updated
- [ ] Logs flowing correctly
- [ ] No alert noise

**Documentation:**
- [ ] Deployment documented
- [ ] Issues logged
- [ ] Metrics baseline updated
- [ ] Post-mortem scheduled (if issues)

---

## 3. Database Migration Strategy

### 3.1 Zero-Downtime SQL Patterns

#### Pattern 1: Add Column (NULL First)

**Step 1: Add Column as NULL**
```sql
-- Migration 001_add_user_preferences.sql
ALTER TABLE users 
ADD COLUMN preferences JSONB NULL;
```

**Step 2: Backfill Data (Optional)**
```sql
-- Backfill in batches
UPDATE users 
SET preferences = '{}'::jsonb 
WHERE preferences IS NULL 
AND id BETWEEN 1 AND 1000;
```

**Step 3: Make Column NOT NULL (Next Deploy)**
```sql
-- Migration 002_make_preferences_not_null.sql
ALTER TABLE users 
ALTER COLUMN preferences SET NOT NULL;
```

#### Pattern 2: Add Index Concurrently

```sql
-- Non-blocking index creation
CREATE INDEX CONCURRENTLY idx_campaigns_status_created 
ON campaigns(status, created_at);
```

#### Pattern 3: Rename Column (Two-Step)

**Step 1: Add New Column**
```sql
ALTER TABLE campaigns 
ADD COLUMN new_name VARCHAR(255);
```

**Step 2: Copy Data & Switch (Next Deploy)**
```sql
-- Copy data
UPDATE campaigns SET new_name = old_name;

-- Switch in application code first, then:
ALTER TABLE campaigns DROP COLUMN old_name;
```

### 3.2 Safe Schema Evolution Rules

**✅ Safe Operations (Zero-Downtime):**
- Add new column (NULL first)
- Add new table
- Add index (CONCURRENTLY)
- Add foreign key (with validation)
- Add check constraint (validate first)

**⚠️ Risky Operations (Require Care):**
- Rename column (two-step process)
- Change column type (requires data migration)
- Drop column (after application switch)
- Add NOT NULL constraint (after backfill)

**❌ Unsafe Operations (Avoid):**
- DROP TABLE
- TRUNCATE TABLE
- DROP COLUMN (without application switch)
- Change primary key

### 3.3 Backward-Compatible API Rules

**API Versioning:**
- Keep old API endpoints during transition
- New endpoints use `/v2/` prefix
- Deprecate old endpoints after full migration
- Support both versions during switch

**Response Format:**
- Add new fields to responses (backward compatible)
- Don't remove fields until next major version
- Use feature flags for breaking changes

### 3.4 Worker Job Compatibility

**Job Format:**
- Jobs must be backward-compatible
- Both Blue and Green workers can process same jobs
- Job schema versioning if needed
- Graceful handling of unknown job types

**Example:**
```go
type EmailJob struct {
    Version int    `json:"version"` // Job schema version
    MessageID string `json:"message_id"`
    // ... other fields
}
```

### 3.5 Versioned Migrations Folder

**Structure:**
```
backend/
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_add_user_preferences.sql
    ├── 003_add_campaign_metadata.sql
    └── ...
```

**Migration Tool:**
- Use `golang-migrate` or similar
- Track applied migrations in database
- Rollback support for each migration
- Dry-run mode for validation

---

## 4. Rollback Plan

### 4.1 Instant Traffic Switch Back

**Rollback Procedure (Target: < 10 seconds):**

**Step 1: Switch Traffic to Blue**
```nginx
# Immediate switch back to Blue
upstream mailblast_backend {
    server blue-backend:8080 weight=100;
    server green-backend:8080 weight=0;
}
```

**Step 2: Reload Load Balancer**
```bash
# Nginx
nginx -s reload

# Or AWS ALB: Update target group weights via console/CLI
aws elbv2 modify-rule --rule-arn <rule-arn> --actions Type=forward,TargetGroupArn=<blue-tg-arn>,Weight=100
```

**Validation:**
- [ ] Traffic switched to Blue
- [ ] Blue environment healthy
- [ ] No traffic to Green
- [ ] Users can access system

### 4.2 Partially Migrated Database

**Scenario:** Migrations applied but need to rollback.

**Strategy:**
1. **If Migration Reversible:**
   ```bash
   # Rollback migration
   ./migrate -path migrations -database "$DATABASE_URL" down 1
   ```

2. **If Migration Not Reversible:**
   - Keep database as-is (Green state)
   - Blue application must support both old and new schema
   - Plan forward migration for next deploy

**Database Rollback Checklist:**
- [ ] Assess migration reversibility
- [ ] Execute rollback if possible
- [ ] Verify database integrity
- [ ] Test Blue application with current DB state
- [ ] Document any schema mismatches

### 4.3 Worker Job Recovery

**Scenario:** Jobs in queue during rollback.

**Strategy:**
- Jobs remain in shared Redis queue
- Blue workers continue processing jobs
- No job loss during rollback
- Monitor queue depth

**Validation:**
- [ ] Queue depth stable
- [ ] Blue workers processing jobs
- [ ] No duplicate job processing
- [ ] Job completion rate normal

### 4.4 Email Sending Queue Consistency

**Scenario:** Emails queued but not sent during switch.

**Strategy:**
- All queued emails remain in queue
- Blue workers process remaining jobs
- No emails lost
- Monitor sending completion

**Validation:**
- [ ] All queued emails eventually sent
- [ ] No email delivery failures
- [ ] Sending metrics accurate
- [ ] Campaign statuses correct

### 4.5 Diagnostic Steps

**Immediate Diagnostics:**
1. **Check Logs:**
   ```bash
   docker logs green-backend --tail 200
   docker logs green-worker --tail 200
   ```

2. **Check Metrics:**
   ```bash
   curl http://green-backend:8080/metrics | grep -i error
   ```

3. **Check Database:**
   ```bash
   psql -h db-host -U postgres -d mailblast -c "SELECT COUNT(*) FROM campaigns;"
   ```

4. **Check Queue:**
   ```bash
   redis-cli LLEN email_queue
   redis-cli LRANGE email_queue 0 10
   ```

5. **Check Health:**
   ```bash
   curl http://green-backend:8080/health
   curl http://green-backend:8080/health/ready
   ```

**Diagnostic Checklist:**
- [ ] Error logs reviewed
- [ ] Metrics analyzed
- [ ] Database connectivity verified
- [ ] Queue status checked
- [ ] Health endpoints tested
- [ ] Root cause identified

### 4.6 Rollback Execution Time

**Target:** < 10 seconds from decision to completion

**Timeline:**
- Decision: 0s
- Load balancer config update: 2s
- Config reload: 1s
- Traffic switch: 1s
- Validation: 5s
- **Total: < 10s**

---

## 5. Monitoring & Alerting

### 5.1 Logs to Monitor

#### Error Logs

**Backend Errors:**
- Application errors (5xx)
- Database connection errors
- Redis connection errors
- SMTP send failures
- SNS webhook errors

**Worker Errors:**
- Job processing failures
- Email send failures
- Retry exhaustion
- Queue connection errors

**Frontend Errors:**
- API call failures
- Authentication errors
- Page load errors

**Log Monitoring:**
```bash
# Real-time error monitoring
tail -f /var/log/mailblast/backend.log | grep -i error

# Error count
grep -i error /var/log/mailblast/backend.log | wc -l
```

#### Latency Logs

**Monitor:**
- API response times
- Database query times
- External API call times (SES, SNS)
- Worker job processing times

**Thresholds:**
- API p95 > 200ms → Warning
- API p95 > 500ms → Critical
- DB query > 1s → Warning
- DB query > 5s → Critical

#### SMTP Failure Logs

**Monitor:**
- SES API errors
- Rate limit errors
- Bounce/complaint events
- Delivery failures

**Alerts:**
- SMTP error rate > 1%
- SES rate limit hit
- Bounce rate spike > 10%

### 5.2 Metrics to Track

#### Application Metrics

| Metric | Description | Threshold |
|--------|-------------|-----------|
| `total_requests` | Total API requests | Monitor trend |
| `total_errors` | Total errors | < 0.1% of requests |
| `opens_tracked` | Email opens tracked | Monitor trend |
| `clicks_tracked` | Link clicks tracked | Monitor trend |
| `emails_sent` | Emails sent | Monitor trend |
| `emails_delivered` | Emails delivered | > 95% of sent |
| `emails_bounced` | Emails bounced | < 5% of sent |
| `worker_throughput` | Emails processed/min | > 500/min |
| `queue_backlog` | Pending jobs | < 1,000 |
| `average_response_time_ms` | Avg API response | < 100ms |
| `p95_response_time_ms` | 95th percentile | < 200ms |
| `p99_response_time_ms` | 99th percentile | < 500ms |
| `cache_hit_rate` | Cache efficiency | > 70% |
| `db_connection_pool_usage` | DB pool usage | < 80% |
| `worker_cpu_percent` | Worker CPU | < 70% |
| `worker_memory_mb` | Worker memory | < 2GB |

### 5.3 Alert Definitions

#### Critical Alerts

**Alert: High Error Rate**
- Condition: Error rate > 1% for 2 minutes
- Severity: Critical
- Notification: Email, Slack, PagerDuty
- Action: Immediate investigation, rollback if needed

**Alert: High Latency**
- Condition: p95 latency > 2s for 2 minutes
- Severity: Critical
- Notification: Email, Slack, PagerDuty
- Action: Investigate, consider rollback

**Alert: Worker Crash**
- Condition: Worker process down
- Severity: Critical
- Notification: Email, Slack, PagerDuty
- Action: Restart worker, investigate

**Alert: Database Connection Saturation**
- Condition: DB connection pool > 95%
- Severity: Critical
- Notification: Email, Slack, PagerDuty
- Action: Increase pool size, investigate

**Alert: Queue Backlog Critical**
- Condition: Queue backlog > 10,000
- Severity: Critical
- Notification: Email, Slack, PagerDuty
- Action: Scale workers, investigate

#### Warning Alerts

**Alert: Elevated Error Rate**
- Condition: Error rate > 0.5% for 5 minutes
- Severity: Warning
- Notification: Email, Slack

**Alert: High Memory Usage**
- Condition: Memory > 80% for 10 minutes
- Severity: Warning
- Notification: Email

**Alert: Worker Lag**
- Condition: Worker lag > 1,000 jobs
- Severity: Warning
- Notification: Email, Slack

**Alert: Tracking Endpoint Latency**
- Condition: p99 tracking latency > 200ms for 5 minutes
- Severity: Warning
- Notification: Email

### 5.4 Worker Lag Threshold

**Definition:** Number of unprocessed jobs in queue

**Thresholds:**
- Normal: < 100 jobs
- Warning: 100 - 1,000 jobs
- Critical: > 1,000 jobs

**Monitoring:**
```bash
# Check queue depth
redis-cli LLEN email_queue

# Monitor worker throughput
curl http://backend:8080/metrics | grep worker_throughput
```

### 5.5 Tracking Endpoint Failure Detection

**Monitoring:**
- Response time tracking
- Error rate tracking
- Success rate monitoring

**Alerts:**
- Tracking endpoint error rate > 0.1%
- Tracking p99 latency > 200ms
- Tracking endpoint down (5xx errors)

**Validation:**
```bash
# Health check for tracking
curl -I http://backend:8080/track/open/health-check

# Monitor tracking metrics
curl http://backend:8080/metrics | grep tracking
```

---

## 6. Release Checklist

### 6.1 Pre-Deployment Checklist

**Code & Build:**
- [ ] All code merged to `main` branch
- [ ] Code review approved
- [ ] CI/CD pipeline passed
- [ ] Backend Docker image built and tagged
- [ ] Frontend Docker image built and tagged
- [ ] Worker Docker image built and tagged
- [ ] All images pushed to registry
- [ ] Image versions verified

**Testing:**
- [ ] Unit tests passed
- [ ] Integration tests passed
- [ ] E2E tests passed
- [ ] Performance tests passed
- [ ] Security scan passed
- [ ] QA sign-off obtained
- [ ] UAT completed (if applicable)

**Database:**
- [ ] Migrations reviewed
- [ ] Migrations backward-compatible
- [ ] Migration dry-run successful
- [ ] Database backup completed
- [ ] Backup verified and stored

**Environment:**
- [ ] Green environment provisioned
- [ ] Environment variables configured
- [ ] Secrets configured
- [ ] SSL certificates installed
- [ ] Load balancer configured
- [ ] Network connectivity verified

**Monitoring:**
- [ ] Monitoring dashboards ready
- [ ] Alert rules configured
- [ ] Notification channels tested
- [ ] Metrics collection verified

### 6.2 Deployment Checklist

**Deployment:**
- [ ] New images pulled to Green
- [ ] Migrations applied successfully
- [ ] Backend containers deployed
- [ ] Frontend containers deployed
- [ ] Worker containers deployed
- [ ] All containers running
- [ ] No container crashes

**Validation:**
- [ ] Health check passed
- [ ] Readiness check passed
- [ ] Smoke tests passed
- [ ] API endpoints accessible
- [ ] Tracking endpoints reachable
- [ ] Workers processing jobs
- [ ] Queue depth normal
- [ ] No critical errors in logs
- [ ] Metrics collecting correctly

**SMTP & External Services:**
- [ ] SMTP connectivity OK
- [ ] SES credentials valid
- [ ] SNS webhook reachable
- [ ] Test email sent successfully

### 6.3 Traffic Switch Checklist

**Before Switch:**
- [ ] Green environment validated
- [ ] All smoke tests passed
- [ ] Monitoring active
- [ ] Rollback plan ready
- [ ] Team notified

**During Switch:**
- [ ] 10% traffic switched
- [ ] Monitored for 5 minutes
- [ ] No errors detected
- [ ] 50% traffic switched
- [ ] Monitored for 10 minutes
- [ ] Metrics stable
- [ ] 100% traffic switched
- [ ] Monitored for 15 minutes
- [ ] All metrics normal

**After Switch:**
- [ ] All traffic on Green
- [ ] Blue marked idle
- [ ] Monitoring continues
- [ ] No issues reported

### 6.4 Post-Deployment Checklist

**Functional Validation:**
- [ ] Campaign creation works
- [ ] Email sending works
- [ ] Tracking works
- [ ] Analytics accurate
- [ ] Settings accessible
- [ ] User management works

**Performance Validation:**
- [ ] Response times within targets
- [ ] No performance degradation
- [ ] Queue processing normal
- [ ] Worker throughput acceptable

**Monitoring:**
- [ ] All metrics collecting
- [ ] Alerts working correctly
- [ ] Dashboards updated
- [ ] Logs flowing correctly

**Documentation:**
- [ ] Deployment documented
- [ ] Issues logged
- [ ] Metrics baseline updated
- [ ] Post-mortem scheduled (if needed)

---

## 7. Final Release Sign-off

### 7.1 Sign-off Requirements

**QA Approval:**
- [ ] All test scenarios passed
- [ ] No blocking defects
- [ ] Performance targets met
- [ ] Security validation passed

**Dev Approval:**
- [ ] Code review completed
- [ ] Technical validation passed
- [ ] Architecture review approved
- [ ] No known technical issues

**DevOps Approval:**
- [ ] Deployment process validated
- [ ] Infrastructure ready
- [ ] Monitoring configured
- [ ] Rollback plan tested
- [ ] Backup strategy verified

**Product Acceptance:**
- [ ] Business requirements met
- [ ] UAT completed successfully
- [ ] User feedback positive
- [ ] Feature completeness verified

### 7.2 Sign-off Form

**Release Information:**
- **Release Version:** v1.2.0
- **Release Date:** [YYYY-MM-DD]
- **Deployed By:** [Name]
- **Deployment Duration:** [Time]

**Sign-off:**

| Role | Name | Signature | Date | Approval |
|------|------|-----------|------|----------|
| QA Lead | | | | ⬜ Approved / ⬜ Rejected |
| Development Lead | | | | ⬜ Approved / ⬜ Rejected |
| DevOps Lead | | | | ⬜ Approved / ⬜ Rejected |
| Product Owner | | | | ⬜ Approved / ⬜ Rejected |

**Overall Release Status:** ⬜ **APPROVED** / ⬜ **REJECTED**

**Notes and Conditions:**
```
[Space for additional notes, conditions, or concerns]
```

**Deployment Summary:**
- Total deployment time: [Duration]
- Issues encountered: [Number]
- Rollbacks required: [Number]
- Post-deployment issues: [List]

---

## 8. Deployment Scripts

### 8.1 Deployment Automation Script

**File:** `scripts/deploy-green.sh`

```bash
#!/bin/bash
set -e

VERSION="${1:-latest}"
ENV="${2:-green}"

echo "🚀 Deploying MailBlast v${VERSION} to ${ENV} environment"

# Pull images
echo "📥 Pulling images..."
docker pull registry.example.com/mailblast-backend:${VERSION}
docker pull registry.example.com/mailblast-frontend:${VERSION}
docker pull registry.example.com/mailblast-worker:${VERSION}

# Run migrations
echo "🗄️  Running migrations..."
./migrate -path migrations -database "$DATABASE_URL" up

# Deploy containers
echo "🐳 Deploying containers..."
docker-compose -f docker-compose.${ENV}.yml up -d

# Wait for health
echo "⏳ Waiting for health checks..."
sleep 10

# Run smoke tests
echo "🧪 Running smoke tests..."
./scripts/smoke-tests-${ENV}.sh

echo "✅ Deployment complete!"
```

### 8.2 Rollback Script

**File:** `scripts/rollback.sh`

```bash
#!/bin/bash
set -e

echo "🔄 Rolling back to Blue environment..."

# Switch traffic to Blue
echo "🔄 Switching traffic to Blue..."
# Update load balancer config (Nginx or ALB)
# ... load balancer specific commands ...

# Verify Blue is healthy
echo "✅ Verifying Blue environment..."
curl -f http://blue-backend:8080/health || exit 1

echo "✅ Rollback complete! Traffic switched to Blue."
```

---

**Document Status:** ✅ Ready for Production Deployment  
**Last Updated:** 2025-01-XX  
**Next Steps:** Execute deployment following this plan

