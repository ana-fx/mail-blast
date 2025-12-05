# Step 5: Redis Queue System

## Overview

This step implements a Redis-based queue system for email job processing. The system uses a structured `EmailJob` format with batch support, allowing emails to be queued via HTTP endpoint and processed asynchronously by a worker.

## Architecture

```
HTTP Server → Redis Queue → Worker → (Future: SES)
```

**Flow:**
1. Client sends request to `POST /queue/test`
2. Server creates `EmailJob` with batch_id
3. Job is enqueued to Redis list "email_queue"
4. Worker continuously dequeues jobs (BLPOP)
5. Worker processes and logs job (SES integration in next step)

## Components

### 1. EmailJob Struct (`internal/queue/job.go`)

Defines the structure of email jobs in the queue.

**Structure:**
```go
type EmailJob struct {
    ClientID   string   `json:"client_id"`
    ContactIDs []string `json:"contact_ids"`
    TemplateID string   `json:"template_id"`
    BatchID    string   `json:"batch_id"`
}
```

**Fields:**
- `ClientID` - ID of the client sending the email
- `ContactIDs` - Array of contact IDs to send emails to
- `TemplateID` - Email template identifier
- `BatchID` - Unique batch identifier (UUID) for tracking

**Purpose:**
- Supports batch email sending
- Enables tracking via batch_id
- Allows template-based email sending
- JSON serializable for Redis storage

### 2. Redis Queue Client (`internal/queue/redis.go`)

Manages Redis connection and queue operations.

**Exported Variable:**
```go
var Queue *redis.Client
```

**Functions:**

**InitRedis(addr string) error**
- Initializes Redis client connection
- Takes Redis address as parameter
- Tests connection with PING
- Sets global `Queue` variable

**EnqueueEmail(job EmailJob) error**
- Marshals EmailJob to JSON
- Pushes job to Redis list "email_queue" using LPUSH
- Returns error if queue is not initialized or marshal fails

**Queue Name:**
- `"email_queue"` - Fixed queue name for all email jobs

**How it works:**
- Uses `LPUSH` to add jobs to left side of list (FIFO)
- Jobs are stored as JSON strings in Redis
- Connection is shared between server and worker

### 3. Worker (`cmd/worker/main.go`)

Background worker that processes email jobs from Redis queue.

**Startup Flow:**
1. Load configuration
2. Initialize Redis connection using `queue.InitRedis()`
3. Start infinite processing loop

**Processing Loop:**
```go
for {
    1. BLPOP 0 on "email_queue" (blocking wait)
    2. Unmarshal JSON to EmailJob
    3. Print "New Job Received:" with job details
    4. (Future: Send emails via SES)
}
```

**Features:**
- Blocking dequeue using `BRPOP` (waits for jobs)
- JSON unmarshaling of job data
- Error handling (logs errors, continues processing)
- Graceful shutdown on SIGTERM/SIGINT

**Log Output:**
```
Worker started
New Job Received: {ClientID:test-client ContactIDs:[test1 test2] TemplateID:test-template BatchID:uuid}
```

**Error Handling:**
- Dequeue errors are logged, worker continues
- Unmarshal errors are logged, worker continues
- Worker never crashes on individual job failures

### 4. HTTP Endpoint (`cmd/server/main.go`)

Test endpoint for queuing email jobs.

**Route:** `POST /queue/test`

**Request:**
- No body required (all data is generated)

**Response (200 OK):**
```json
{
  "queued": true,
  "batch_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**How it works:**
1. Generate batch_id using UUID
2. Create EmailJob with:
   - `ClientID`: "test-client"
   - `ContactIDs`: ["test1", "test2"]
   - `TemplateID`: "test-template"
   - `BatchID`: generated UUID
3. Call `queue.EnqueueEmail(job)`
4. Return success response with batch_id

**Error Responses:**
- `500 Internal Server Error` - Failed to queue email

## Configuration

### Environment Variables

**`.env`:**
```env
REDIS_ADDR=localhost:6379
```

**Required:**
- `REDIS_ADDR` - Redis server address (host:port format)

### Dependencies

**go.mod:**
- `github.com/redis/go-redis/v9 v9.5.1` - Redis client library
- `github.com/google/uuid` - UUID generation

## Running the System

### 1. Start Redis Server

```bash
# Make sure Redis is running
redis-server

# Or if using Homebrew on macOS:
brew services start redis

# Verify Redis is running:
redis-cli ping
# Should return: PONG
```

### 2. Start Worker

```bash
cd backend
go run cmd/worker/main.go
```

**Expected Output:**
```
Worker started
```

Worker will wait for jobs (blocking on BLPOP).

### 3. Start Server (in separate terminal)

```bash
cd backend
go run cmd/server/main.go
```

**Expected Output:**
```
Server starting on port 8080
```

### 4. Send Test Request

```bash
curl -X POST http://localhost:8080/queue/test
```

**Expected Response:**
```json
{
  "queued": true,
  "batch_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 5. Check Worker Logs

**Expected Worker Output:**
```
New Job Received: {ClientID:test-client ContactIDs:[test1 test2] TemplateID:test-template BatchID:550e8400-e29b-41d4-a716-446655440000}
```

## Queue Operations

### Enqueue (Server Side)

```go
job := queue.EmailJob{
    ClientID:   "client-123",
    ContactIDs: []string{"contact-1", "contact-2"},
    TemplateID: "welcome-email",
    BatchID:    uuid.New().String(),
}

err := queue.EnqueueEmail(job)
```

### Dequeue (Worker Side)

```go
// BLPOP is blocking - waits for job
result, err := queue.Queue.BRPop(ctx, 0, "email_queue").Result()

// Unmarshal JSON
var job queue.EmailJob
json.Unmarshal([]byte(result[1]), &job)
```

## Data Flow

### Job Creation to Processing

1. **Server receives request** → `POST /queue/test`
2. **Generate batch_id** → UUID v4
3. **Create EmailJob** → Struct with all fields
4. **Marshal to JSON** → `{"client_id":"...","contact_ids":[...],...}`
5. **LPUSH to Redis** → Add to "email_queue" list
6. **Return response** → `{"queued": true, "batch_id": "..."}`
7. **Worker BLPOP** → Blocking wait for job
8. **Unmarshal JSON** → Convert back to EmailJob struct
9. **Process job** → Log job details (SES in next step)

## Error Handling

### Server Errors

- **Redis connection failure** → Server won't start (fatal)
- **Enqueue failure** → Returns 500 error to client
- **UUID generation failure** → Returns 500 error to client

### Worker Errors

- **Redis connection failure** → Worker won't start (fatal)
- **BLPOP error** → Logged, worker continues
- **JSON unmarshal error** → Logged, worker continues

**Worker Resilience:**
- Never crashes on individual job failures
- All errors are logged
- Processing continues after errors

## Integration

### Server Integration

**`cmd/server/main.go`:**
- Initializes Redis on startup: `queue.InitRedis(cfg.RedisAddr)`
- Registers `POST /queue/test` endpoint
- Uses `queue.EnqueueEmail()` to add jobs

### Worker Integration

**`cmd/worker/main.go`:**
- Initializes Redis on startup: `queue.InitRedis(cfg.RedisAddr)`
- Uses `queue.Queue.BRPop()` for blocking dequeue
- Processes jobs in background goroutine

## Architecture Benefits

1. **Batch Processing** - Supports sending to multiple contacts
2. **Tracking** - Batch ID enables job tracking
3. **Scalability** - Multiple workers can process same queue
4. **Reliability** - Jobs persist in Redis if worker crashes
5. **Separation** - Server handles HTTP, worker handles processing
6. **Template Support** - Template ID enables template-based emails

## Differences from Step 4

**Step 4:**
- Simple email job: `{to, subject, body_html, from}`
- Single recipient
- Direct email sending

**Step 5:**
- Structured EmailJob: `{client_id, contact_ids, template_id, batch_id}`
- Multiple recipients (batch)
- Template-based
- Batch tracking
- Ready for SES integration

## Future Enhancements (Step 6)

- Replace job logging with actual SES email sending
- Fetch contact emails from database using ContactIDs
- Load email template using TemplateID
- Send emails to all contacts in batch
- Track email sending status
- Handle bounces and failures

## Testing

### Complete Test Flow

```bash
# Terminal 1: Start Worker
cd backend
go run cmd/worker/main.go

# Terminal 2: Start Server  
cd backend
go run cmd/server/main.go

# Terminal 3: Send Test Request
curl -X POST http://localhost:8080/queue/test

# Check Terminal 1 for job processing log
```

### Verify Queue in Redis

```bash
# Check queue length
redis-cli LLEN email_queue

# View queue contents
redis-cli LRANGE email_queue 0 -1
```

## Summary

- Redis queue system with structured EmailJob
- Batch email support with tracking
- Worker processes jobs asynchronously
- Test endpoint for queueing jobs
- Ready for SES integration in Step 6

