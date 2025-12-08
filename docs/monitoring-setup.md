# Monitoring Setup Guide

## Overview

This guide describes how to set up monitoring for MailBlast platform to track performance, detect issues, and trigger alerts.

## Monitoring Stack

- **Metrics Collection:** Prometheus
- **Visualization:** Grafana
- **Alerting:** Alertmanager
- **Logging:** Structured logs (zerolog) → Loki (optional)
- **APM:** Custom metrics endpoint

## 1. Prometheus Configuration

### prometheus.yml

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'mailblast-api'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
    
  - job_name: 'mailblast-worker'
    static_configs:
      - targets: ['localhost:8081']  # Worker metrics port
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']  # postgres_exporter
```

## 2. Backend Metrics Endpoint

### Implementation

The backend should expose metrics at `/metrics`:

```go
// Example metrics endpoint
func (h *Handler) Metrics(c *fiber.Ctx) error {
    metrics := map[string]interface{}{
        "total_requests": h.metrics.TotalRequests(),
        "total_errors": h.metrics.TotalErrors(),
        "opens_tracked": h.metrics.OpensTracked(),
        "clicks_tracked": h.metrics.ClicksTracked(),
        "emails_sent": h.metrics.EmailsSent(),
        "emails_delivered": h.metrics.EmailsDelivered(),
        "emails_bounced": h.metrics.EmailsBounced(),
        "worker_throughput": h.metrics.WorkerThroughput(),
        "queue_backlog": h.metrics.QueueBacklog(),
        "average_response_time_ms": h.metrics.AvgResponseTime(),
        "p95_response_time_ms": h.metrics.P95ResponseTime(),
        "p99_response_time_ms": h.metrics.P99ResponseTime(),
        "cache_hit_rate": h.metrics.CacheHitRate(),
        "db_connection_pool_usage": h.metrics.DBConnectionPoolUsage(),
        "worker_cpu_percent": h.metrics.WorkerCPUPercent(),
        "worker_memory_mb": h.metrics.WorkerMemoryMB(),
    }
    return c.JSON(metrics)
}
```

## 3. Grafana Dashboards

### Dashboard: System Overview

**Panels:**
1. Request Rate (req/s)
2. Error Rate (%)
3. Response Time (p50, p95, p99)
4. Active Users
5. Queue Depth
6. Worker Throughput

### Dashboard: Email Metrics

**Panels:**
1. Emails Sent (total, rate)
2. Emails Delivered
3. Emails Bounced
4. Open Rate
5. Click Rate
6. Bounce Rate

### Dashboard: Tracking Performance

**Panels:**
1. Open Tracking (req/s)
2. Click Tracking (req/s)
3. Tracking Latency (p95, p99)
4. Cache Hit Rate
5. Error Rate

### Dashboard: System Resources

**Panels:**
1. CPU Usage (%)
2. Memory Usage (MB, %)
3. Disk I/O (read/write)
4. Network I/O
5. Database Connections
6. Go GC Pause Time

## 4. Alert Rules

### alertmanager.yml

```yaml
route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'mailblast-alerts'

receivers:
  - name: 'mailblast-alerts'
    email_configs:
      - to: 'devops@mailblast.test'
        from: 'alerts@mailblast.test'
        smarthost: 'smtp.example.com:587'
        auth_username: 'alerts@mailblast.test'
        auth_password: 'password'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#alerts'
```

### Prometheus Alert Rules

```yaml
groups:
  - name: mailblast_alerts
    rules:
      - alert: HighAPILatency
        expr: http_request_duration_seconds{quantile="0.95"} > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API latency detected"
          description: "p95 latency is {{ $value }}s (threshold: 2s)"
      
      - alert: CriticalAPILatency
        expr: http_request_duration_seconds{quantile="0.95"} > 5
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Critical API latency"
          description: "p95 latency is {{ $value }}s (threshold: 5s)"
      
      - alert: QueueBacklogHigh
        expr: queue_backlog > 5000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Queue backlog is high"
          description: "Queue backlog is {{ $value }} (threshold: 5000)"
      
      - alert: WorkerCrash
        expr: up{job="mailblast-worker"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Worker process is down"
          description: "Worker process has been down for more than 1 minute"
      
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate"
          description: "Error rate is {{ $value }} (threshold: 1%)"
      
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.8
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"
```

## 5. Logging Configuration

### Structured Logging

Backend should use structured logging (zerolog):

```go
logger.Info().
    Str("endpoint", "/campaigns").
    Int("status", 200).
    Dur("duration", duration).
    Int("size", responseSize).
    Msg("request_completed")
```

### Log Levels

- **DEBUG:** Development only
- **INFO:** Normal operations
- **WARN:** Recoverable issues
- **ERROR:** Errors requiring attention
- **FATAL:** Critical errors (process exit)

## 6. Health Check Endpoints

### `/health`

```json
{
  "status": "healthy",
  "timestamp": "2025-01-XXT00:00:00Z",
  "version": "1.0.0"
}
```

### `/health/ready`

```json
{
  "status": "ready",
  "database": "connected",
  "redis": "connected",
  "worker": "running"
}
```

### `/health/live`

```json
{
  "status": "alive"
}
```

## 7. Monitoring Checklist

- [ ] Prometheus scraping metrics
- [ ] Grafana dashboards configured
- [ ] Alert rules defined
- [ ] Alertmanager configured
- [ ] Email notifications working
- [ ] Slack notifications working
- [ ] Health checks implemented
- [ ] Metrics endpoint exposed
- [ ] Logging structured
- [ ] Log aggregation configured (optional)

## 8. Performance Baselines

Establish baselines before load testing:

- Normal load metrics
- Peak load metrics
- Resource usage patterns
- Error rates
- Response time distributions

Use these baselines to:
- Set alert thresholds
- Plan capacity
- Identify anomalies
- Track improvements

