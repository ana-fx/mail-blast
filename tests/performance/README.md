# Performance Testing Suite

This directory contains performance and load testing scripts for MailBlast.

## Prerequisites

### k6
```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Or download from https://k6.io/docs/getting-started/installation/
```

### Locust
```bash
pip install locust
```

### Vegeta
```bash
# macOS
brew install vegeta

# Linux
go install github.com/tsenart/vegeta/v12@latest
```

## Test Scripts

### k6 Scripts

1. **k6-campaign-creation.js** - Campaign creation API load test
2. **k6-tracking-stress.js** - Tracking endpoints stress test
3. **k6-analytics-load.js** - Analytics queries load test
4. **k6-soak-test.js** - 12-hour stability test

### Locust

- **locustfile.py** - User behavior simulation

### Vegeta

- **vegeta-tracking.sh** - Tracking endpoint benchmarking

## Running Tests

### Campaign Creation Load Test

```bash
export API_URL=http://localhost:8080
export TOKEN=your-jwt-token
k6 run k6-campaign-creation.js
```

### Tracking Stress Test

```bash
export API_URL=http://localhost:8080
k6 run k6-tracking-stress.js
```

### Analytics Load Test

```bash
export API_URL=http://localhost:8080
export TOKEN=your-jwt-token
k6 run k6-analytics-load.js
```

### Soak Test (12 hours)

```bash
export API_URL=http://localhost:8080
export TOKEN=your-jwt-token
k6 run --duration 12h k6-soak-test.js
```

### Locust User Simulation

```bash
locust -f locustfile.py --host=http://localhost:8080
# Then open http://localhost:8089 in browser
```

### Vegeta Benchmark

```bash
export API_URL=http://localhost:8080
export RATE=5000  # requests per second
export DURATION=60s
./vegeta-tracking.sh
```

## Test Results

Results are output to console. For detailed analysis:

- **k6**: Use `k6 run --out json=results.json script.js` for JSON output
- **Locust**: View real-time stats in web UI (http://localhost:8089)
- **Vegeta**: HTML plot generated automatically

## Performance Targets

See `docs/load-testing-strategy.md` for detailed KPI targets.

## Monitoring

During tests, monitor:
- Server CPU, RAM, Disk I/O
- Database connection pool
- Queue depth
- Worker throughput
- Error rates
- Response times

Use Grafana/Prometheus dashboards for real-time monitoring.

