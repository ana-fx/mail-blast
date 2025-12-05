# Step 2: PostgreSQL Setup with GORM

## Overview

This step implements PostgreSQL database connection using GORM ORM, including database migrations and the Client model.

## Components

### 1. Client Model (`internal/models/client.go`)

Defines the Client data structure.

**Structure:**
```go
type Client struct {
    ID          uuid.UUID  // Primary key, auto-generated
    Name        string     // Client name
    SenderEmail string     // Email sender (to be configured later)
    CreatedAt   time.Time // Creation timestamp
    UpdatedAt   time.Time // Last update timestamp
}
```

**Features:**
- UUID primary key with auto-generation
- GORM hooks for UUID generation
- Automatic timestamps

### 2. Database Connection (`internal/db/db.go`)

Manages PostgreSQL connection and migrations.

**Functions:**
- `InitDB(databaseURL string) error` - Initializes database connection

**How it works:**
1. Opens PostgreSQL connection using GORM
2. Enables UUID extension (`uuid-ossp`)
3. Runs auto-migration for models
4. Returns error if connection fails

**Auto-Migration:**
- Creates `clients` table automatically
- Handles schema changes on model updates

**Database Extension:**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 3. Server Integration (`cmd/server/main.go`)

Server startup includes database initialization.

**Startup Flow:**
1. Load configuration
2. Initialize database connection
3. **If DB connection fails → `log.Fatal` (server won't start)**
4. Initialize Fiber
5. Register routes
6. Start server

**New Route:**
- **`GET /db-check`** - Database connection status

### 4. Database Check Endpoint

**Route:** `GET /db-check`

**Response (200):**
```json
{
  "db": "ok"
}
```

**Response (503) if DB not connected:**
```json
{
  "db": "not connected"
}
```

**How it works:**
1. Checks if `db.DB` is not nil
2. Returns status based on connection state

## Database Schema

### Clients Table

Auto-created via GORM migration:

```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    sender_email VARCHAR,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

## Dependencies Added

**go.mod:**
- `gorm.io/gorm` - GORM ORM
- `gorm.io/driver/postgres` - PostgreSQL driver for GORM
- `github.com/google/uuid` - UUID generation

## Configuration

### Database URL Format

```
postgres://username:password@host:port/database?sslmode=disable
```

**Example:**
```
DATABASE_URL=postgres://macbookpro:@localhost:5432/mydb?sslmode=disable
```

## Error Handling

**Database Connection Failure:**
- Server will **not start** if database connection fails
- Error logged with `log.Fatalf`
- Ensures database is available before serving requests

**Common Issues:**
- Database doesn't exist → Create database first
- Wrong credentials → Check `.env` file
- PostgreSQL not running → Start PostgreSQL service

## Running the Server

```bash
cd backend
go run cmd/server/main.go
```

**Prerequisites:**
1. PostgreSQL must be running
2. Database must exist (create with `CREATE DATABASE mydb;`)
3. Valid `DATABASE_URL` in `.env` file

**Test:**
```bash
# Health check
curl http://localhost:8080/health

# Database check
curl http://localhost:8080/db-check
```

## Architecture

```
┌─────────────────┐
│   HTTP Server   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Database Init   │
│  (GORM)          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL     │
│   (mydb)         │
└─────────────────┘
```

## Database Operations

**Exported Variable:**
- `db.DB *gorm.DB` - Global database instance

**Usage in other packages:**
```go
import "backend/internal/db"

// Use db.DB for queries
db.DB.Find(&clients)
```

## Next Steps

- Step 3: Implement Contacts CRUD (uses this database setup)
- Add more models and migrations
- Implement database transactions
- Add database connection pooling configuration

