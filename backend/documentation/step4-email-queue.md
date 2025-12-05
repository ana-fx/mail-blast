# Step 4: Email Queue System

## Overview

This step implements an email queue system using Redis for job processing. Emails are queued via HTTP endpoint and processed asynchronously by a worker using a dummy email provider for development/testing.

## Architecture

```
HTTP Server → Queue (Redis) → Worker → DummyMailer
```

**Flow:**
1. Client sends email request to HTTP endpoint
2. Server validates and enqueues job to Redis
3. Worker continuously dequeues jobs from Redis
4. Worker processes email using DummyMailer (logs only, no real sending)

## Components

### 1. Dummy Email Provider (`internal/email/dummy.go`)

Fake email sender for development/testing that logs email details without actually sending.

**Structure:**
```go
type DummyMailer struct{}

func NewDummyMailer() *DummyMailer
func (d *DummyMailer) SendEmail(to, subject, htmlBody, from string) error
```

**Behavior:**
- Does NOT send real emails
- Logs email details in format: `[DUMMY EMAIL] To: X | Subject: Y | From: Z`
- Returns `nil` (always succeeds)

**Usage:**
```go
mailer := email.NewDummyMailer()
mailer.SendEmail("user@example.com", "Hello", "<h1>Hi</h1>", "no-reply@domain.com")
```

### 2. Email Job Struct (`internal/email/job.go`)

Defines the structure of email jobs stored in the queue.

**Structure:**
```go
type EmailJob struct {
    To       string `json:"to"`
    Subject  string `json:"subject"`
    BodyHTML string `json:"body_html"`
    From     string `json:"from"`
}
```

**Purpose:**
- Serialized to JSON for queue storage
- Deserialized by worker for processing

### 3. Redis Queue Client (`internal/queue/redis.go`)

Manages Redis connection and queue operations.

**Functions:**
- `Connect() error` - Initializes Redis client connection
- `Close() error` - Closes Redis connection
- `Enqueue(data []byte) error` - Adds job to queue (LPUSH)
- `Dequeue() ([]byte, error)` - Removes job from queue (BRPOP, blocking)

**Queue Name:**
- `"mail_queue"` - Fixed queue name for email jobs

**How it works:**
- `Enqueue`: Uses `LPUSH` to add job to left side of list
- `Dequeue`: Uses `BRPOP` (blocking) to wait for and remove job from right side
- Shared client instance for both server and worker

**Connection:**
- Connects to Redis using `REDIS_ADDR` from config
- Tests connection with `PING` before use
- No password by default (configurable)

### 4. Worker (`cmd/worker/main.go`)

Background worker that processes email jobs from the queue.

**Startup Flow:**
1. Load configuration
2. Connect to Redis (required, fatal if fails)
3. Connect to database (optional, warning if fails)
4. Initialize DummyMailer
5. Start infinite processing loop

**Processing Loop:**
```go
for {
    1. Dequeue job (blocking, waits for job)
    2. Unmarshal JSON to EmailJob
    3. Call DummyMailer.SendEmail()
    4. Log success/error (never crashes)
}
```

**Error Handling:**
- Errors are logged but worker continues running
- Never crashes on individual job failures
- Continues processing next job after error

**Log Output:**
- `[WORKER] Email sent to user@example.com (dummy mode)` - Success
- `Error dequeuing job: ...` - Queue error
- `Error unmarshaling job: ...` - JSON error
- `Error sending email to ...: ...` - Send error

**Graceful Shutdown:**
- Listens for SIGTERM/SIGINT
- Closes Redis connection on shutdown

### 5. HTTP Endpoint (`internal/handlers/email_handler.go`)

HTTP handler for queuing emails.

**Route:** `POST /send-email`

**Request Body:**
```json
{
  "to": "john@example.com",
  "subject": "Hello",
  "body_html": "<h1>Hi!</h1>",
  "from": "no-reply@domain.com"
}
```

**Response (200 OK):**
```json
{
  "status": "queued"
}
```

**How it works:**
1. Parse and validate request body
2. Validate required fields (to, subject, body_html, from)
3. Convert to `EmailJob` struct
4. Marshal to JSON
5. Enqueue to Redis queue
6. Return success response

**Error Responses:**
- `400 Bad Request` - Invalid request body or missing required fields
- `500 Internal Server Error` - Failed to marshal job or enqueue to Redis

## Configuration

### Environment Variables

**`.env.example`:**
```env
REDIS_ADDR=localhost:6379
```

**Required:**
- `REDIS_ADDR` - Redis server address (host:port)

**Optional:**
- `DATABASE_URL` - Database connection (for worker, optional)

### Dependencies

**go.mod:**
- `github.com/redis/go-redis/v9 v9.5.1` - Redis client library

## Running the System

### 1. Start Redis Server

```bash
# Make sure Redis is running
redis-server
# Or if using Homebrew on macOS
brew services start redis
```

### 2. Start HTTP Server

```bash
cd backend
go run cmd/server/main.go
```

Server will:
- Connect to Redis
- Register `/send-email` endpoint
- Start on port 8080

### 3. Start Worker

```bash
cd backend
go run cmd/worker/main.go
```

Worker will:
- Connect to Redis
- Start processing queue
- Log: `Worker started`

### 4. Send Email Request

```bash
curl -X POST http://localhost:8080/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Test Email",
    "body_html": "<h1>Hello World</h1>",
    "from": "no-reply@domain.com"
  }'
```

**Expected Output:**

**Server log:**
- Request received and queued

**Worker log:**
```
[DUMMY EMAIL] To: user@example.com | Subject: Test Email | From: no-reply@domain.com
[WORKER] Email sent to user@example.com (dummy mode)
```

## Queue Operations

### Enqueue (Server Side)

```go
job := email.EmailJob{
    To:       "user@example.com",
    Subject:  "Hello",
    BodyHTML: "<h1>Hi</h1>",
    From:     "no-reply@domain.com",
}

jobData, _ := json.Marshal(job)
queue.Enqueue(jobData)
```

### Dequeue (Worker Side)

```go
jobData, err := queue.Dequeue() // Blocking call
var job email.EmailJob
json.Unmarshal(jobData, &job)
```

## Error Handling

### Server Errors

- **Redis connection failure** → Server won't start (fatal)
- **Queue enqueue failure** → Returns 500 error to client
- **Invalid request** → Returns 400 error to client

### Worker Errors

- **Redis connection failure** → Worker won't start (fatal)
- **Dequeue error** → Logged, worker continues
- **JSON unmarshal error** → Logged, worker continues
- **Send email error** → Logged, worker continues

**Worker never crashes** - All errors are logged and processing continues.

## Integration

### Server Integration

**`cmd/server/main.go`:**
- Initializes Redis connection on startup
- Registers `/send-email` endpoint
- Uses shared `queue.Client` for enqueue operations

### Worker Integration

**`cmd/server/main.go`:**
- Initializes Redis connection on startup
- Uses shared `queue.Client` for dequeue operations
- Processes jobs in background goroutine

## Architecture Benefits

1. **Asynchronous Processing** - HTTP requests return immediately
2. **Scalability** - Multiple workers can process queue
3. **Reliability** - Jobs persist in Redis if worker crashes
4. **Separation of Concerns** - Server handles HTTP, worker handles processing
5. **Development Friendly** - DummyMailer allows testing without real email

## Future Enhancements

- Replace DummyMailer with real AWS SES implementation
- Add job retry mechanism
- Add job priority levels
- Add job status tracking
- Add dead letter queue for failed jobs
- Add rate limiting
- Add email templates
- Add batch email processing

