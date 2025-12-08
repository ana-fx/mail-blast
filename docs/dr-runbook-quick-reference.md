# DR Runbook Quick Reference

**For:** On-Call Engineers  
**Purpose:** Quick action guide during disaster recovery

---

## Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Incident Commander | | | |
| Database Admin | | | |
| DevOps Lead | | | |
| Backend Lead | | | |

---

## Quick Decision Tree

```
Disaster Detected
    │
    ├─ Application Down?
    │   └─→ Scenario A: Application Server Failure
    │
    ├─ Database Down/Corrupted?
    │   └─→ Scenario B: Database Failure
    │
    ├─ Complete Infrastructure Loss?
    │   └─→ Scenario C: Complete VPS/Data Center Loss
    │
    ├─ Queue Not Processing?
    │   └─→ Scenario D: Email Queue Corruption
    │
    └─ Webhook Events Missing?
        └─→ Scenario E: SNS Webhook Outage
```

---

## Quick Commands

### Check System Status
```bash
# Health
curl http://server:8080/health

# Database
psql -h $DB_HOST -U $DB_USER -d mailblast -c "SELECT 1;"

# Queue
redis-cli LLEN email_queue

# Workers
docker ps | grep worker
```

### Restore Database
```bash
./scripts/restore-db.sh [backup-file] mailblast
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Check Backups
```bash
# Latest backup
aws s3 ls s3://backups/mailblast/db/full/ | tail -1

# WAL status
./scripts/check-wal-archiving.sh
```

### Replay SNS Events
```bash
./scripts/replay-sns-events.sh
```

---

## RTO/RPO Targets

- **RPO:** ≤ 15 minutes
- **RTO:** ≤ 30 minutes

---

## Rollback Decision

**Rollback if:**
- Recovery taking > 30 minutes
- Data integrity compromised
- Multiple failures during recovery
- Cannot validate system health

**Rollback command:**
```bash
./scripts/rollback.sh
```

---

**Last Updated:** [Date]  
**Next Review:** After each DR drill

