# Disaster Recovery Plan (DRP) & Backup Strategy
## MailBlast Email Marketing Platform

**Version:** 1.0  
**Date:** 2025-01-XX  
**Prepared By:** Senior Cloud Architect & SRE  
**Status:** Production Ready

---

## Table of Contents

1. [DR Strategy Overview](#1-dr-strategy-overview)
2. [Backup Strategy Matrix](#2-backup-strategy-matrix)
3. [Disaster Scenarios & Response Steps](#3-disaster-scenarios--response-steps)
4. [Failover Runbook](#4-failover-runbook)
5. [Automated DR Testing Procedures](#5-automated-dr-testing-procedures)
6. [Monitoring & Alerting (DR-focused)](#6-monitoring--alerting-dr-focused)
7. [DR Readiness Checklist](#7-dr-readiness-checklist)

---

## 1. DR Strategy Overview

### 1.1 Core System Components

**Primary Components:**
- **Frontend:** Next.js application (Docker container)
- **Backend API:** Go application (Docker container)
- **Workers:** Go background workers (Docker containers)
- **Database:** PostgreSQL (persistent storage)
- **Queue:** Redis (in-memory, can be persisted)
- **File Storage:** Local filesystem or S3-compatible
- **SMTP:** AWS SES (external service)
- **Webhooks:** AWS SNS (external service)

### 1.2 Failure Types Handled

| Failure Type | Impact | Recovery Strategy | RPO | RTO |
|--------------|--------|-------------------|-----|-----|
| **Database Corruption** | Data loss, system down | Restore from backup + WAL | 15 min | 20 min |
| **Server Crash** | Application unavailable | Redeploy containers | 0 min | 10 min |
| **Data Center Outage** | Complete system loss | Restore to new infrastructure | 15 min | 30 min |
| **Application Regression** | Functionality broken | Rollback to previous version | 0 min | 5 min |
| **Queue/Job Corruption** | Email sending stopped | Drain & rehydrate queue | 5 min | 15 min |
| **SES Webhook Failure** | Event tracking lost | Replay from DLQ | 15 min | 20 min |
| **Network Partition** | Partial connectivity | Failover to backup region | 0 min | 15 min |

### 1.3 RPO/RTO Definitions

**RPO (Recovery Point Objective): ≤ 15 minutes**
- Maximum acceptable data loss: 15 minutes
- Achieved through: WAL archiving every 15 minutes
- Backup frequency: Full daily + WAL every 15 min

**RTO (Recovery Time Objective): ≤ 30 minutes**
- Maximum acceptable downtime: 30 minutes
- Achieved through: Automated recovery scripts
- Infrastructure: Pre-configured backup servers

### 1.4 Recovery Levels

#### Minor Disaster
**Definition:** Single component failure, no data loss

**Examples:**
- Application container crash
- Worker process failure
- Single server issue

**Recovery:**
- RPO: 0 minutes (no data loss)
- RTO: 5-10 minutes
- Action: Restart containers, scale workers

#### Major Disaster
**Definition:** Multiple components affected, potential data loss

**Examples:**
- Database corruption
- Server hardware failure
- Queue corruption

**Recovery:**
- RPO: 15 minutes (WAL restore)
- RTO: 20-30 minutes
- Action: Restore from backup, rebuild infrastructure

#### Catastrophic Disaster
**Definition:** Complete infrastructure loss

**Examples:**
- Data center outage
- Complete server loss
- Network infrastructure failure

**Recovery:**
- RPO: 15 minutes (offsite backup)
- RTO: 30 minutes
- Action: Full infrastructure rebuild, restore from offsite backup

### 1.5 DR Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRIMARY INFRASTRUCTURE                       │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Frontend   │  │   Backend     │  │   Workers    │         │
│  │  (Next.js)   │  │    (Go)       │  │    (Go)      │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                 │
│  ┌──────▼──────────────────▼──────────────────▼──────────┐    │
│  │              PostgreSQL Database                        │    │
│  │  ┌──────────────────────────────────────────────┐     │    │
│  │  │  WAL Archiving → S3 (every 15 min)            │     │    │
│  │  │  Full Backup → S3 (daily)                      │     │    │
│  │  └──────────────────────────────────────────────┘     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐                           │
│  │    Redis     │  │ File Storage │                           │
│  │   (Queue)    │  │  (Local/S3)  │                           │
│  └──────────────┘  └──────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Backup & Replication
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                  BACKUP & RECOVERY LAYER                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  S3 Offsite Backup Storage                              │  │
│  │  ├── Full DB Backups (daily, 30-day retention)          │  │
│  │  ├── WAL Archives (every 15 min, 7-day retention)        │  │
│  │  ├── Docker Images (versioned, 90-day retention)        │  │
│  │  ├── Config Files (versioned)                            │  │
│  │  └── Application Data (campaigns, templates)            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  DR Infrastructure (Standby)                           │  │
│  │  ├── Backup Server (pre-configured)                     │  │
│  │  ├── Database Server (standby)                           │  │
│  │  └── Application Servers (on-demand)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Failover
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│              DISASTER RECOVERY INFRASTRUCTURE                   │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Frontend   │  │   Backend     │  │   Workers    │        │
│  │  (Restored)  │  │  (Restored)   │  │  (Restored)  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Restored Database (from S3 backup + WAL)               │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Backup Strategy Matrix

### 2.1 Database Backups (PostgreSQL)

| Backup Type | Schedule | Retention | Encryption | Storage Location | RPO |
|-------------|----------|-----------|------------|------------------|-----|
| **Full Backup** | Daily at 02:00 UTC | 30 days | AES-256 | S3: `s3://backups/mailblast/db/full/` | 24 hours |
| **WAL Archive** | Every 15 minutes | 7 days | AES-256 | S3: `s3://backups/mailblast/db/wal/` | 15 minutes |
| **Point-in-Time** | On-demand | 7 days | AES-256 | S3: `s3://backups/mailblast/db/pitr/` | Variable |
| **Schema Backup** | Weekly | 90 days | AES-256 | S3: `s3://backups/mailblast/db/schema/` | 7 days |

**Backup Script:**
```bash
#!/bin/bash
# daily-db-backup.sh

DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="mailblast-full-${DATE}.sql.gz"
S3_BUCKET="s3://backups/mailblast/db/full/"

# Full backup with compression
pg_dump -h $DB_HOST -U $DB_USER -d mailblast | \
  gzip | \
  openssl enc -aes-256-cbc -salt -k "$ENCRYPTION_KEY" | \
  aws s3 cp - "${S3_BUCKET}${BACKUP_FILE}"

# Verify backup
aws s3 ls "${S3_BUCKET}${BACKUP_FILE}"

echo "✅ Backup completed: ${BACKUP_FILE}"
```

**WAL Archiving Configuration:**
```bash
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'aws s3 cp %p s3://backups/mailblast/db/wal/%f --sse AES256'
archive_timeout = 900  # 15 minutes
```

### 2.2 Application & Worker Backups

| Component | Backup Type | Schedule | Retention | Storage Location |
|-----------|-------------|----------|-----------|------------------|
| **Docker Images** | Versioned tags | On each build | 90 days | Container Registry + S3 |
| **Environment Variables** | Encrypted file | Daily | 90 days | S3: `s3://backups/mailblast/config/` |
| **Config Files** | Versioned | On change | 90 days | S3: `s3://backups/mailblast/config/` |
| **SSL Certificates** | Full backup | Monthly | 1 year | S3: `s3://backups/mailblast/certs/` |

**Environment Variables Backup:**
```bash
#!/bin/bash
# backup-env.sh

DATE=$(date +%Y%m%d)
ENV_BACKUP="env-backup-${DATE}.enc"

# Encrypt and backup environment variables
env | openssl enc -aes-256-cbc -salt -k "$ENCRYPTION_KEY" | \
  aws s3 cp - "s3://backups/mailblast/config/${ENV_BACKUP}"

echo "✅ Environment variables backed up"
```

### 2.3 Email Campaign Data

| Data Type | Backup Method | Schedule | Retention | Storage Location |
|-----------|---------------|----------|-----------|------------------|
| **Campaign Metadata** | Database backup | Included in DB backup | 30 days | S3 (via DB backup) |
| **Template JSON** | Database + S3 | On save | 90 days | S3: `s3://backups/mailblast/templates/` |
| **Contact Lists** | Database backup | Included in DB backup | 30 days | S3 (via DB backup) |
| **Email Content** | Database backup | Included in DB backup | 30 days | S3 (via DB backup) |

### 2.4 Tracking Event Backup Strategy

**Strategy:**
- Tracking events stored in database (included in DB backups)
- Real-time replication to backup table (optional)
- WAL archiving captures all events
- RPO: 15 minutes (via WAL)

**Backup Table (Optional):**
```sql
-- Backup table for tracking events
CREATE TABLE email_events_backup AS 
SELECT * FROM email_events;

-- Sync every 15 minutes
-- (Can be done via trigger or scheduled job)
```

### 2.5 SES/SNS Recovery Plan

#### SNS Webhook Re-subscription

**Procedure:**
1. Access AWS SNS Console
2. Navigate to Topic: `mailblast-email-events`
3. Verify subscription endpoint: `https://mailblast.example.com/api/webhooks/sns`
4. If subscription lost, re-subscribe:
   ```bash
   aws sns subscribe \
     --topic-arn arn:aws:sns:us-east-1:123456789:mailblast-email-events \
     --protocol https \
     --notification-endpoint https://mailblast.example.com/api/webhooks/sns
   ```
5. Confirm subscription (check email/webhook)

#### Event Replay from Dead Letter Queue

**DLQ Configuration:**
- SNS → SQS Dead Letter Queue
- Failed webhook deliveries → DLQ
- Replay script processes DLQ

**Replay Script:**
```bash
#!/bin/bash
# replay-sns-events.sh

# Process DLQ messages
aws sqs receive-message \
  --queue-url https://sqs.us-east-1.amazonaws.com/123456789/mailblast-dlq \
  --max-number-of-messages 10 | \
  jq -r '.Messages[] | .Body' | \
  while read event; do
    # Replay event to webhook endpoint
    curl -X POST https://mailblast.example.com/api/webhooks/sns \
      -H "Content-Type: application/json" \
      -d "$event"
  done
```

**Duplicate Prevention:**
- Use SNS MessageId as idempotency key
- Check database before processing
- Skip if event already processed

---

## 3. Disaster Scenarios & Response Steps

### Scenario A: Application Server Failure

**Impact:** Application unavailable, no data loss

**Recovery Steps:**

1. **Identify Failure:**
   ```bash
   # Check server status
   ssh server-host
   docker ps -a
   docker logs backend --tail 50
   ```

2. **Redeploy Containers:**
   ```bash
   # Restart containers
   docker-compose -f docker-compose.prod.yml restart
   
   # Or redeploy
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Recover Environment Variables:**
   ```bash
   # Restore from backup
   aws s3 cp s3://backups/mailblast/config/env-backup-latest.enc - | \
     openssl enc -aes-256-cbc -d -k "$ENCRYPTION_KEY" > .env
   
   # Reload environment
   export $(cat .env | xargs)
   ```

4. **Start Workers:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d worker
   docker-compose -f docker-compose.prod.yml scale worker=3
   ```

5. **Validate Tracking Endpoints:**
   ```bash
   curl -I http://server:8080/track/open/test-123
   curl -I http://server:8080/track/click/test-123?url=aHR0cHM6Ly9leGFtcGxlLmNvbQ==
   ```

6. **Verify System Health:**
   ```bash
   curl http://server:8080/health
   curl http://server:8080/health/ready
   curl http://server:8080/metrics
   ```

**Expected RTO:** 10 minutes  
**Expected RPO:** 0 minutes (no data loss)

---

### Scenario B: Database Failure

**Impact:** Database corrupted or unavailable, potential data loss

**Recovery Steps:**

1. **Assess Damage:**
   ```bash
   # Check database status
   psql -h $DB_HOST -U postgres -c "SELECT 1;"
   
   # Check last backup
   aws s3 ls s3://backups/mailblast/db/full/ | tail -1
   ```

2. **Stop Application:**
   ```bash
   # Stop all containers to prevent further writes
   docker-compose -f docker-compose.prod.yml stop backend worker
   ```

3. **Restore Full Backup:**
   ```bash
   # Download latest full backup
   LATEST_BACKUP=$(aws s3 ls s3://backups/mailblast/db/full/ | sort | tail -1 | awk '{print $4}')
   aws s3 cp "s3://backups/mailblast/db/full/${LATEST_BACKUP}" - | \
     openssl enc -aes-256-cbc -d -k "$ENCRYPTION_KEY" | \
     gunzip > restore.sql
   
   # Restore database
   psql -h $DB_HOST -U postgres -d mailblast < restore.sql
   ```

4. **Restore WAL Logs:**
   ```bash
   # Find WAL files since last backup
   BACKUP_TIME="2025-01-XX 02:00:00"
   
   # Restore WAL archives
   aws s3 sync s3://backups/mailblast/db/wal/ /var/lib/postgresql/wal_archive/
   
   # Replay WAL (PostgreSQL will do this automatically if configured)
   # Or manually:
   pg_restore -h $DB_HOST -U postgres -d mailblast /var/lib/postgresql/wal_archive/
   ```

5. **Validate Schema Migrations:**
   ```bash
   # Check migration status
   ./migrate -path migrations -database "$DATABASE_URL" version
   
   # Verify schema
   psql -h $DB_HOST -U postgres -d mailblast -c "\d campaigns"
   psql -h $DB_HOST -U postgres -d mailblast -c "\d email_events"
   ```

6. **Reconnect Backend Apps:**
   ```bash
   # Start backend
   docker-compose -f docker-compose.prod.yml up -d backend
   
   # Verify connection
   curl http://server:8080/health/ready
   ```

7. **Re-process Email Jobs if Needed:**
   ```bash
   # Check queue status
   redis-cli LLEN email_queue
   
   # If jobs lost, re-queue from database
   # (Script to re-queue failed jobs from campaigns table)
   ```

**Expected RTO:** 20 minutes  
**Expected RPO:** 15 minutes (WAL restore)

---

### Scenario C: Complete VPS/Data Center Loss

**Impact:** Complete infrastructure loss, need full rebuild

**Recovery Steps:**

1. **Instantiate New Server:**
   ```bash
   # Provision new VPS/instance
   # - Same OS version
   # - Same specifications
   # - Network configured
   ```

2. **Install Dependencies:**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose
   
   # Install PostgreSQL client
   apt-get update && apt-get install -y postgresql-client
   ```

3. **Pull Latest Images:**
   ```bash
   # Pull from registry
   docker pull registry.example.com/mailblast-backend:latest
   docker pull registry.example.com/mailblast-frontend:latest
   docker pull registry.example.com/mailblast-worker:latest
   ```

4. **Restore Database from Offsite Backup:**
   ```bash
   # Download and restore full backup
   LATEST_BACKUP=$(aws s3 ls s3://backups/mailblast/db/full/ | sort | tail -1 | awk '{print $4}')
   aws s3 cp "s3://backups/mailblast/db/full/${LATEST_BACKUP}" - | \
     openssl enc -aes-256-cbc -d -k "$ENCRYPTION_KEY" | \
     gunzip | psql -h $DB_HOST -U postgres -d mailblast
   
   # Restore WAL archives
   aws s3 sync s3://backups/mailblast/db/wal/ /var/lib/postgresql/wal_archive/
   ```

5. **Restore Configuration:**
   ```bash
   # Restore environment variables
   aws s3 cp s3://backups/mailblast/config/env-backup-latest.enc - | \
     openssl enc -aes-256-cbc -d -k "$ENCRYPTION_KEY" > .env
   
   # Restore config files
   aws s3 sync s3://backups/mailblast/config/ ./config/
   ```

6. **Reconfigure DNS:**
   ```bash
   # Update DNS records to point to new server IP
   # Via DNS provider console or API
   # TTL should be low (300s) for quick failover
   ```

7. **Reconnect SES Webhooks:**
   ```bash
   # Re-subscribe SNS topic
   aws sns subscribe \
     --topic-arn arn:aws:sns:us-east-1:123456789:mailblast-email-events \
     --protocol https \
     --notification-endpoint https://mailblast.example.com/api/webhooks/sns
   
   # Verify subscription
   aws sns list-subscriptions-by-topic \
     --topic-arn arn:aws:sns:us-east-1:123456789:mailblast-email-events
   ```

8. **Deploy Application:**
   ```bash
   # Start containers
   docker-compose -f docker-compose.prod.yml up -d
   
   # Scale workers
   docker-compose -f docker-compose.prod.yml scale worker=3
   ```

9. **Validate Email Sending & Tracking:**
   ```bash
   # Test email send
   curl -X POST http://server:8080/api/campaigns/test/send \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"to": "test@example.com", "subject": "DR Test"}'
   
   # Test tracking
   curl -I http://server:8080/track/open/test-123
   curl -I http://server:8080/track/click/test-123?url=aHR0cHM6Ly9leGFtcGxlLmNvbQ==
   
   # Verify metrics
   curl http://server:8080/metrics
   ```

**Expected RTO:** 30 minutes  
**Expected RPO:** 15 minutes (offsite backup + WAL)

---

### Scenario D: Email Queue Corruption

**Impact:** Email sending stopped, jobs stuck in queue

**Recovery Steps:**

1. **Identify Corruption:**
   ```bash
   # Check queue status
   redis-cli LLEN email_queue
   redis-cli LRANGE email_queue 0 10
   
   # Check worker logs
   docker logs worker --tail 100 | grep -i error
   ```

2. **Drain Queue:**
   ```bash
   # Move corrupted jobs to DLQ
   redis-cli --eval drain-queue.lua email_queue corrupted_queue
   
   # Or clear queue if necessary
   redis-cli DEL email_queue
   ```

3. **Rehydrate from Backup Table:**
   ```bash
   # Query database for pending campaigns
   psql -h $DB_HOST -U postgres -d mailblast -c "
     SELECT id, name, status 
     FROM campaigns 
     WHERE status IN ('scheduled', 'sending')
     ORDER BY created_at;
   "
   
   # Re-queue campaigns
   # (Script to re-queue campaigns from database)
   ./scripts/re-queue-campaigns.sh
   ```

4. **Retry Failed Jobs:**
   ```bash
   # Check failed jobs table
   psql -h $DB_HOST -U postgres -d mailblast -c "
     SELECT * FROM failed_jobs 
     WHERE created_at > NOW() - INTERVAL '24 hours'
     ORDER BY created_at DESC;
   "
   
   # Retry failed jobs
   ./scripts/retry-failed-jobs.sh
   ```

5. **Verify Queue Processing:**
   ```bash
   # Monitor queue depth
   watch -n 5 'redis-cli LLEN email_queue'
   
   # Check worker throughput
   curl http://server:8080/metrics | grep worker_throughput
   ```

**Expected RTO:** 15 minutes  
**Expected RPO:** 5 minutes (queue state)

---

### Scenario E: SNS Webhook Outage

**Impact:** Email delivery events not received, tracking incomplete

**Recovery Steps:**

1. **Detect Outage:**
   ```bash
   # Check SNS subscription status
   aws sns list-subscriptions-by-topic \
     --topic-arn arn:aws:sns:us-east-1:123456789:mailblast-email-events
   
   # Check webhook endpoint
   curl -I https://mailblast.example.com/api/webhooks/sns
   ```

2. **Use Dead Letter Queue (DLQ):**
   ```bash
   # Check DLQ for failed deliveries
   aws sqs get-queue-attributes \
     --queue-url https://sqs.us-east-1.amazonaws.com/123456789/mailblast-dlq \
     --attribute-names ApproximateNumberOfMessages
   ```

3. **Replay Events from DLQ:**
   ```bash
   # Process DLQ messages
   ./scripts/replay-sns-events.sh
   ```

4. **Ensure No Duplicate Delivery Events:**
   ```bash
   # Check for duplicates in database
   psql -h $DB_HOST -U postgres -d mailblast -c "
     SELECT sns_message_id, COUNT(*) 
     FROM email_events 
     WHERE meta->>'sns_message_id' IS NOT NULL
     GROUP BY sns_message_id 
     HAVING COUNT(*) > 1;
   "
   ```

5. **Re-subscribe Webhook:**
   ```bash
   # Re-subscribe if subscription lost
   aws sns subscribe \
     --topic-arn arn:aws:sns:us-east-1:123456789:mailblast-email-events \
     --protocol https \
     --notification-endpoint https://mailblast.example.com/api/webhooks/sns
   ```

6. **Validate Event Processing:**
   ```bash
   # Monitor event processing
   watch -n 5 'curl -s http://server:8080/metrics | grep events_processed'
   ```

**Expected RTO:** 20 minutes  
**Expected RPO:** 15 minutes (DLQ replay)

---

## 4. Failover Runbook

### 4.1 Roles & Responsibilities

| Role | Responsibility | Contact |
|------|----------------|---------|
| **Incident Commander** | Overall coordination | [Name/Phone] |
| **Database Admin** | Database restore | [Name/Phone] |
| **DevOps Engineer** | Infrastructure rebuild | [Name/Phone] |
| **Backend Engineer** | Application recovery | [Name/Phone] |
| **SRE** | Monitoring & validation | [Name/Phone] |

### 4.2 Step Order

**Phase 1: Assessment (5 minutes)**
1. Incident Commander declares disaster
2. Team notified via PagerDuty/Slack
3. Assess scope and impact
4. Determine recovery scenario
5. Assign roles

**Phase 2: Recovery Execution (15-25 minutes)**
1. Execute scenario-specific recovery steps
2. Monitor progress
3. Validate each step
4. Document issues

**Phase 3: Validation (5 minutes)**
1. Run smoke tests
2. Verify critical functionality
3. Check monitoring
4. Validate data integrity

**Phase 4: Communication (Ongoing)**
1. Update status page
2. Notify stakeholders
3. Document recovery
4. Schedule post-mortem

### 4.3 Commands to Run

**Quick Reference:**
```bash
# Health check
curl http://server:8080/health

# Database status
psql -h $DB_HOST -U postgres -c "SELECT version();"

# Queue status
redis-cli LLEN email_queue

# Worker status
docker ps | grep worker

# Latest backup
aws s3 ls s3://backups/mailblast/db/full/ | tail -1

# Restore database
./scripts/restore-db.sh

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Check logs
docker logs backend --tail 100 -f
```

### 4.4 Verification Steps

**After Each Recovery:**
- [ ] Health endpoint responds
- [ ] Database queries work
- [ ] API endpoints accessible
- [ ] Workers processing jobs
- [ ] Tracking endpoints respond
- [ ] Metrics collecting
- [ ] No critical errors in logs

### 4.5 Rollback Rules

**If Recovery Fails:**
1. Stop recovery attempt
2. Document what was tried
3. Escalate to senior engineer
4. Consider alternative recovery path
5. If all fails, restore from older backup (accept higher RPO)

---

## 5. Automated DR Testing Procedures

### 5.1 Quarterly DR Drills

**Schedule:** Every 3 months

**Drill Scenarios:**
- Month 1: Application server failure
- Month 2: Database failure
- Month 3: Complete infrastructure loss

**Procedure:**
1. **Pre-Drill:**
   - [ ] Schedule drill date
   - [ ] Notify team
   - [ ] Prepare test environment
   - [ ] Backup current state

2. **During Drill:**
   - [ ] Simulate disaster scenario
   - [ ] Execute recovery steps
   - [ ] Time each step
   - [ ] Document issues

3. **Post-Drill:**
   - [ ] Review recovery time
   - [ ] Identify improvements
   - [ ] Update runbooks
   - [ ] Share learnings

**Success Criteria:**
- RTO met (< 30 minutes)
- RPO met (< 15 minutes)
- All systems functional
- No data loss

### 5.2 WAL Restore Simulation

**Quarterly Test:**
```bash
#!/bin/bash
# test-wal-restore.sh

echo "Testing WAL restore procedure..."

# 1. Create test database
createdb mailblast_test

# 2. Restore full backup
LATEST_BACKUP=$(aws s3 ls s3://backups/mailblast/db/full/ | sort | tail -1 | awk '{print $4}')
aws s3 cp "s3://backups/mailblast/db/full/${LATEST_BACKUP}" - | \
  openssl enc -aes-256-cbc -d -k "$ENCRYPTION_KEY" | \
  gunzip | psql -d mailblast_test

# 3. Restore WAL archives
aws s3 sync s3://backups/mailblast/db/wal/ /tmp/wal_test/

# 4. Verify data integrity
psql -d mailblast_test -c "SELECT COUNT(*) FROM campaigns;"
psql -d mailblast_test -c "SELECT COUNT(*) FROM email_events;"

# 5. Cleanup
dropdb mailblast_test

echo "✅ WAL restore test completed"
```

### 5.3 Full Server Rebuild Practice

**Monthly Test:**
1. Provision new test server
2. Restore from backup
3. Deploy application
4. Validate functionality
5. Measure recovery time
6. Document improvements

### 5.4 SES Webhook Replay Testing

**Monthly Test:**
```bash
#!/bin/bash
# test-sns-replay.sh

# 1. Send test email via SES
aws ses send-email \
  --from test@mailblast.test \
  --to test@example.com \
  --subject "DR Test" \
  --text "Test email for DR validation"

# 2. Wait for SNS event
sleep 30

# 3. Check DLQ for events
aws sqs receive-message \
  --queue-url https://sqs.us-east-1.amazonaws.com/123456789/mailblast-dlq

# 4. Replay events
./scripts/replay-sns-events.sh

# 5. Verify events processed
curl http://server:8080/metrics | grep events_processed

echo "✅ SNS replay test completed"
```

### 5.5 Observability Validation

**Weekly Check:**
- [ ] All metrics collecting
- [ ] Alerts configured correctly
- [ ] Logs flowing
- [ ] Dashboards updated
- [ ] Backup jobs running
- [ ] WAL archiving working

---

## 6. Monitoring & Alerting (DR-focused)

### 6.1 Backup Failure Alerts

**Alert: Backup Job Failed**
- Condition: Daily backup job fails
- Severity: Critical
- Notification: Email, Slack, PagerDuty
- Action: Investigate immediately, manual backup if needed

**Alert: WAL Archiving Failure**
- Condition: WAL archive fails for 30 minutes
- Severity: Critical
- Notification: Email, Slack, PagerDuty
- Action: Check disk space, S3 connectivity, fix archiving

**Alert: Backup Not Recent**
- Condition: Last backup > 26 hours old
- Severity: Warning
- Notification: Email, Slack
- Action: Investigate backup schedule

### 6.2 Worker Stuck Detection

**Alert: Worker Stuck**
- Condition: Worker hasn't processed job in 5 minutes
- Severity: Warning
- Notification: Email, Slack
- Action: Check worker logs, restart if needed

**Alert: Worker Crash**
- Condition: Worker process down
- Severity: Critical
- Notification: Email, Slack, PagerDuty
- Action: Restart worker, investigate crash

### 6.3 SES Webhook Delivery Problems

**Alert: SNS Subscription Unhealthy**
- Condition: SNS subscription status != "Confirmed"
- Severity: Critical
- Notification: Email, Slack, PagerDuty
- Action: Re-subscribe webhook

**Alert: DLQ Message Count High**
- Condition: DLQ messages > 100
- Severity: Warning
- Notification: Email, Slack
- Action: Replay DLQ messages

### 6.4 Server Resource Anomalies

**Alert: High CPU Usage**
- Condition: CPU > 90% for 10 minutes
- Severity: Warning
- Notification: Email
- Action: Investigate, scale if needed

**Alert: High Memory Usage**
- Condition: Memory > 90% for 10 minutes
- Severity: Warning
- Notification: Email
- Action: Investigate memory leak, restart if needed

**Alert: Disk Space Low**
- Condition: Disk usage > 85%
- Severity: Warning
- Notification: Email, Slack
- Action: Clean up logs, increase disk size

### 6.5 Database Replication Lag (if enabled)

**Alert: Replication Lag**
- Condition: Replication lag > 1 minute
- Severity: Warning
- Notification: Email
- Action: Investigate network, replication process

---

## 7. DR Readiness Checklist

### 7.1 Daily Checks

- [ ] Backups completed successfully (verified last 24h)
- [ ] WAL archiving working (last archive < 20 min ago)
- [ ] No backup failures in last 24h
- [ ] Disk space > 20% available
- [ ] All services running
- [ ] No critical alerts

### 7.2 Weekly Checks

- [ ] Restore simulation passed
- [ ] WAL logs healthy (all archives accessible)
- [ ] Database encryption active
- [ ] Offsite backup reachable
- [ ] Docker images cached locally
- [ ] SES Webhook SNS subscription OK
- [ ] Worker queues stable
- [ ] Monitoring dashboards functional

### 7.3 Monthly Checks

- [ ] Full DR drill completed
- [ ] Backup retention policy verified
- [ ] Recovery scripts tested
- [ ] Team trained on DR procedures
- [ ] Contact list updated
- [ ] Documentation reviewed
- [ ] RTO/RPO targets met in drill

### 7.4 Quarterly Checks

- [ ] Complete infrastructure rebuild test
- [ ] Offsite backup restore test
- [ ] SNS webhook replay test
- [ ] Database point-in-time restore test
- [ ] DR runbook updated
- [ ] Post-mortem from drills completed
- [ ] Improvements implemented

---

## 8. Backup & Restore Scripts

### 8.1 Automated Backup Scripts

**File:** `scripts/backup-db-daily.sh`

```bash
#!/bin/bash
# Daily database backup script
# Run via cron: 0 2 * * * /path/to/backup-db-daily.sh

set -e

DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="mailblast-full-${DATE}.sql.gz"
S3_BUCKET="s3://backups/mailblast/db/full/"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY}"

echo "Starting daily database backup: ${DATE}"

# Full backup with compression and encryption
pg_dump -h "${DB_HOST}" -U "${DB_USER}" -d mailblast \
  --no-owner --no-acl | \
  gzip | \
  openssl enc -aes-256-cbc -salt -k "${ENCRYPTION_KEY}" | \
  aws s3 cp - "${S3_BUCKET}${BACKUP_FILE}" \
  --storage-class STANDARD_IA

# Verify backup
if aws s3 ls "${S3_BUCKET}${BACKUP_FILE}" > /dev/null; then
    BACKUP_SIZE=$(aws s3 ls "${S3_BUCKET}${BACKUP_FILE}" | awk '{print $3}')
    echo "✅ Backup completed: ${BACKUP_FILE} (${BACKUP_SIZE} bytes)"
    
    # Cleanup old backups (keep 30 days)
    aws s3 ls "${S3_BUCKET}" | while read -r line; do
        BACKUP_DATE=$(echo $line | awk '{print $1" "$2}')
        BACKUP_NAME=$(echo $line | awk '{print $4}')
        if [ -n "$BACKUP_NAME" ]; then
            BACKUP_AGE=$(($(date +%s) - $(date -d "$BACKUP_DATE" +%s)))
            if [ $BACKUP_AGE -gt 2592000 ]; then  # 30 days
                echo "Deleting old backup: ${BACKUP_NAME}"
                aws s3 rm "${S3_BUCKET}${BACKUP_NAME}"
            fi
        fi
    done
else
    echo "❌ Backup verification failed!"
    exit 1
fi
```

**File:** `scripts/restore-db.sh`

```bash
#!/bin/bash
# Database restore script
# Usage: ./restore-db.sh [backup-file] [target-db]

set -e

BACKUP_FILE="${1}"
TARGET_DB="${2:-mailblast}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY}"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file> [target-db]"
    echo "Available backups:"
    aws s3 ls s3://backups/mailblast/db/full/ | tail -5
    exit 1
fi

echo "⚠️  WARNING: This will restore database ${TARGET_DB}"
read -p "Are you sure? (yes/no) " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    exit 0
fi

echo "Restoring from backup: ${BACKUP_FILE}"

# Download, decrypt, and restore
aws s3 cp "s3://backups/mailblast/db/full/${BACKUP_FILE}" - | \
  openssl enc -aes-256-cbc -d -k "${ENCRYPTION_KEY}" | \
  gunzip | \
  psql -h "${DB_HOST}" -U "${DB_USER}" -d "${TARGET_DB}"

echo "✅ Database restore completed"
echo "Next: Restore WAL archives if needed for point-in-time recovery"
```

### 8.2 WAL Archive Monitoring

**File:** `scripts/check-wal-archiving.sh`

```bash
#!/bin/bash
# Check WAL archiving status

LAST_WAL=$(aws s3 ls s3://backups/mailblast/db/wal/ | sort | tail -1 | awk '{print $4}')
LAST_WAL_TIME=$(aws s3 ls s3://backups/mailblast/db/wal/ | sort | tail -1 | awk '{print $1" "$2}')

if [ -n "$LAST_WAL_TIME" ]; then
    WAL_AGE=$(($(date +%s) - $(date -d "$LAST_WAL_TIME" +%s)))
    WAL_AGE_MIN=$((WAL_AGE / 60))
    
    if [ $WAL_AGE_MIN -gt 20 ]; then
        echo "❌ WAL archiving delayed: Last archive ${WAL_AGE_MIN} minutes ago"
        exit 1
    else
        echo "✅ WAL archiving OK: Last archive ${WAL_AGE_MIN} minutes ago"
    fi
else
    echo "❌ No WAL archives found"
    exit 1
fi
```

---

## 9. Risk Assessment Matrix

| Risk | Probability | Impact | Mitigation | Residual Risk |
|------|-------------|--------|------------|---------------|
| Database corruption | Low | High | Daily backups + WAL | Low |
| Server hardware failure | Medium | High | Automated redeploy | Low |
| Data center outage | Low | Critical | Offsite backups | Medium |
| Backup failure | Low | High | Multiple backup methods | Low |
| WAL archiving failure | Low | Medium | Monitoring + alerts | Low |
| SNS webhook loss | Low | Medium | DLQ + replay | Low |
| Queue corruption | Low | Medium | Queue backup + rehydrate | Low |
| Human error | Medium | Medium | Automation + runbooks | Low |

---

## 10. DR Communication Plan

### 10.1 Incident Communication

**Channels:**
- **PagerDuty:** Critical alerts
- **Slack:** Team coordination
- **Email:** Stakeholder updates
- **Status Page:** Public updates (if applicable)

**Communication Template:**
```
Subject: [DR] MailBlast Recovery in Progress

Incident: [Description]
Status: Recovery in progress
RTO Target: 30 minutes
Current Status: [Phase]
ETA: [Time]

Team: [Names]
Next Update: [Time]
```

### 10.2 Post-Recovery Communication

**After Recovery:**
1. Notify stakeholders of recovery
2. Share recovery summary
3. Schedule post-mortem
4. Document lessons learned
5. Update runbooks

---

**Document Status:** ✅ Ready for Production  
**Last Updated:** 2025-01-XX  
**Next Review:** Quarterly DR Drill

