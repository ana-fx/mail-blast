# Step 1: Backend Foundation

## Overview

This step establishes the basic backend infrastructure using Go and Fiber framework with clean architecture principles.

## Project Structure

```
backend/
├── cmd/
│   ├── server/main.go      # HTTP API server
│   └── worker/main.go       # Queue worker (placeholder)
├── internal/
│   ├── config/config.go     # Environment configuration
│   ├── db/db.go             # Database connection (placeholder)
│   ├── queue/redis.go       # Redis client (placeholder)
│   ├── email/ses.go         # AWS SES client (placeholder)
│   └── webhooks/webhook.go  # Webhook handlers (placeholder)
├── go.mod
└── .env.example
```

## Components

### 1. Configuration Loader (`internal/config/config.go`)

Loads environment variables from `.env` file using `godotenv`.

**Config Structure:**
```go
type Config struct {
    AppPort        int
    DatabaseURL    string
    RedisAddr      string
    AWSRegion      string
    AWSAccessKeyID string
    AWSSecretKey   string
}
```

**How it works:**
1. Loads `.env` file (if exists)
2. Reads environment variables
3. Returns `Config` struct with all settings
4. Provides default values if not set

**Usage:**
```go
cfg, err := config.Load()
if err != nil {
    log.Fatalf("Failed to load config: %v", err)
}
```

### 2. HTTP Server (`cmd/server/main.go`)

Basic Fiber HTTP server with health check endpoint.

**Features:**
- Loads configuration
- Initializes Fiber framework
- Health check endpoint: `GET /health`

**Health Endpoint:**
- **Route:** `GET /health`
- **Response (200):**
```json
{
  "status": "ok"
}
```

**How it works:**
1. Load configuration from environment
2. Create Fiber app instance
3. Register `/health` route
4. Start server on `APP_PORT` (default: 8080)

### 3. Worker Placeholder (`cmd/worker/main.go`)

Basic worker entry point for future queue processing.

**Current Implementation:**
- Prints "Worker started"
- Placeholder for future queue worker logic

### 4. Placeholder Modules

All modules are created as placeholders with TODO comments:

- **`internal/db/db.go`** - PostgreSQL connection (to be implemented)
- **`internal/queue/redis.go`** - Redis client (to be implemented)
- **`internal/email/ses.go`** - AWS SES client (to be implemented)
- **`internal/webhooks/webhook.go`** - Webhook handlers (to be implemented)

## Environment Configuration

### `.env.example`

```env
APP_PORT=8080
DATABASE_URL=postgres://postgres:password@localhost:5432/mydb?sslmode=disable
REDIS_ADDR=localhost:6379
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

### Required Dependencies

**go.mod:**
- `github.com/gofiber/fiber/v2` - HTTP framework
- `github.com/joho/godotenv` - Environment variable loader
- `github.com/aws/aws-sdk-go-v2` - AWS SDK v2 (base, no SES yet)

## Running the Server

```bash
cd backend
go run cmd/server/main.go
```

Server will start on port 8080 (or `APP_PORT` from `.env`).

**Test:**
```bash
curl http://localhost:8080/health
```

## Architecture

```
┌─────────────────┐
│   HTTP Server   │
│  (Fiber v2)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Config Loader  │
│   (godotenv)     │
└─────────────────┘
```

## Next Steps

- Step 2: Implement PostgreSQL connection with GORM
- Step 3: Implement Redis queue client
- Step 4: Implement AWS SES email client
- Step 5: Implement webhook handlers

