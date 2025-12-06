# MailBlast Backend

> Professional email marketing backend built with Go, Fiber, PostgreSQL, and Redis

[![Go Version](https://img.shields.io/badge/Go-1.23-blue.svg)](https://golang.org)
[![Fiber](https://img.shields.io/badge/Fiber-v2-00ADD8.svg)](https://gofiber.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D.svg)](https://redis.io)

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [Development Guide](#-development-guide)

## ✨ Features

### Core Features
- ✅ **Contact Management** - Full CRUD operations for contacts
- ✅ **Email Sending** - SMTP integration with AWS SES
- ✅ **Email Tracking** - Open & click tracking with pixel and redirect
- ✅ **Event Processing** - SNS webhook integration for SES events
- ✅ **Analytics Dashboard** - Real-time email performance metrics
- ✅ **Campaign Management** - Create, schedule, and manage email campaigns

### Advanced Features
- 🚀 **Rate Limiting** - IP-based rate limiting for tracking endpoints
- 💾 **Caching** - In-memory caching for analytics queries
- 📊 **Metrics & Monitoring** - Built-in metrics endpoint
- 🔒 **Security** - Open redirect prevention, idempotency checks
- ⚡ **Performance** - Optimized database queries with indexes

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────────────────────────┐
│      Fiber HTTP Server          │
│  ┌───────────────────────────┐  │
│  │  Handlers (REST API)      │  │
│  └───────────┬───────────────┘  │
│              │                   │
│  ┌───────────▼───────────────┐  │
│  │  Services (Business Logic)│  │
│  └───────────┬───────────────┘  │
│              │                   │
│  ┌───────────▼───────────────┐  │
│  │  Repositories (Data Layer)│  │
│  └───────────┬───────────────┘  │
└──────────────┼──────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌─────────────┐  ┌──────────┐
│ PostgreSQL  │  │  Redis   │
└─────────────┘  └──────────┘
```

### Clean Architecture Layers

1. **Handler Layer** - HTTP request/response handling
2. **Service Layer** - Business logic and validation
3. **Repository Layer** - Data access and database operations
4. **Model Layer** - Domain models and entities

## 🚀 Quick Start

### Prerequisites

- Go 1.23+
- PostgreSQL 12+
- Redis 6+

### Installation

```bash
# Clone repository
git clone <repository-url>
cd mail-blast/backend

# Install dependencies
go mod download

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Environment Variables

```env
# Server
APP_PORT=8080

# Database
DATABASE_URL=postgres://user:password@localhost:5432/mailblast?sslmode=disable

# Redis
REDIS_ADDR=localhost:6379

# SMTP (AWS SES)
SMTP_HOST=email-smtp.ap-southeast-2.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password

# Tracking
TRACKING_DOMAIN=http://localhost:8080

# SNS
SNS_VERIFY=false

# Campaign Storage (optional)
CAMPAIGN_STORAGE_PATH=storage/campaigns
```

### Running

```bash
# Start PostgreSQL
# Start Redis
redis-server

# Run migrations (auto-run on startup)
# Start server
go run cmd/server/main.go
```

Server will start on `http://localhost:8080`

### Health Check

```bash
curl http://localhost:8080/health
# {"status":"ok"}
```

## 📚 API Documentation

### Contacts API

#### Create Contact
```http
POST /contacts
Content-Type: application/json

{
  "client_id": "uuid",
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### List Contacts
```http
GET /contacts
```

#### Get Contact
```http
GET /contacts/:id
```

#### Update Contact
```http
PUT /contacts/:id
Content-Type: application/json

{
  "name": "Jane Doe",
  "status": "active"
}
```

#### Delete Contact
```http
DELETE /contacts/:id
```

### Email Sending API

#### Send Email
```http
POST /emails/send
Content-Type: application/json

{
  "from": "sender@example.com",
  "to": ["recipient@example.com"],
  "subject": "Hello",
  "html": "<h1>Hello World</h1>",
  "text": "Hello World"
}
```

**Response:**
```json
{
  "status": "ok",
  "queued": 1,
  "message_ids": ["<uuid@domain.com>"]
}
```

### Campaign API

#### Create Campaign
```http
POST /campaigns
Content-Type: application/json

{
  "title": "Summer Sale",
  "subject": "50% Off",
  "content": "<h1>Summer Sale</h1>",
  "from_email": "noreply@example.com",
  "client_id": "uuid",
  "send_at": "2025-12-25T10:00:00Z"
}
```

#### Get Campaign
```http
GET /campaigns/:id
```

#### Get Campaigns by Client
```http
GET /campaigns/client/:clientId
```

#### Schedule Campaign
```http
POST /campaigns/:id/schedule
Content-Type: application/json

{
  "send_at": "2025-12-25T10:00:00Z"
}
```

### Analytics API

#### Overview Statistics
```http
GET /analytics/overview
```

**Response:**
```json
{
  "total_sent": 1000,
  "total_delivered": 950,
  "total_bounced": 30,
  "total_complaint": 5,
  "open_rate": 0.45,
  "click_rate": 0.12
}
```

#### Timeline Data
```http
GET /analytics/timeline?range=7d
```

**Query Parameters:**
- `range`: `7d`, `30d`, or `90d`

#### Top Clicked Links
```http
GET /analytics/top-links?limit=10
```

#### Email Events
```http
GET /analytics/events/:messageId
```

### Tracking Endpoints

#### Open Tracking
```http
GET /track/open/:messageId.png
```
Returns 1x1 transparent GIF pixel

#### Click Tracking
```http
GET /track/click/:messageId?url=BASE64_ENCODED_URL
```
Redirects to original URL after tracking

### Webhooks

#### SES Events (SNS)
```http
POST /webhooks/ses
Content-Type: application/json
```
Receives SES events via SNS notifications

### Monitoring

#### Metrics
```http
GET /metrics
```

**Response:**
```json
{
  "total_requests": 1000,
  "total_errors": 5,
  "requests_by_status": {"200": 950},
  "emails_sent": 500,
  "emails_delivered": 480,
  "opens_tracked": 200,
  "clicks_tracked": 50,
  "average_response_time_ms": "45ms"
}
```

## ⚙️ Configuration

### Database Schema

**Tables:**
- `clients` - Client information
- `contacts` - Email contacts
- `email_messages` - Sent emails
- `email_events` - Email events (delivery, bounce, open, click)
- `campaigns` - Email campaigns

**Key Indexes:**
- Message-ID lookup
- Event type queries
- Scheduled campaigns
- Client-based queries

### Rate Limiting

Tracking endpoints are rate-limited:
- **Limit:** 100 requests per minute per IP
- **Window:** 1 minute
- **Response:** `429 Too Many Requests`

### Caching

Analytics queries are cached:
- **Overview:** 5 minutes
- **Timeline:** 2 minutes
- **Top Links:** 10 minutes

## 📁 Project Structure

```
backend/
├── cmd/
│   └── server/
│       ├── main.go              # Application entry point
│       └── routes/              # Route registration
├── internal/
│   ├── campaigns/               # Campaign management
│   │   ├── handler.go
│   │   ├── service.go
│   │   └── repository.go
│   ├── contacts/               # Contact management
│   ├── email/                   # Email sending
│   ├── handlers/                # HTTP handlers
│   ├── middleware/              # HTTP middleware
│   │   ├── ratelimit.go
│   │   └── metrics_middleware.go
│   ├── models/                  # Domain models
│   ├── repositories/             # Data access layer
│   ├── services/                # Business logic
│   ├── tracking/                # Email tracking
│   ├── cache/                   # Caching layer
│   ├── metrics/                 # Metrics collection
│   ├── config/                  # Configuration
│   └── db/                      # Database setup
│       └── migrations/          # SQL migrations
├── go.mod
├── go.sum
└── README.md
```

## 🛠️ Development Guide

### Running Tests

```bash
# Run all tests
go test ./...

# Run with coverage
go test -cover ./...

# Run specific package
go test ./internal/campaigns/...
```

### Database Migrations

Migrations run automatically on startup. Manual migration:

```bash
# Connect to PostgreSQL
psql -U postgres -d mailblast

# Run migration file
\i internal/db/migrations/003_campaigns.sql
```

### Code Style

- Follow Go conventions
- Use `gofmt` for formatting
- Use `golint` for linting
- Write tests for new features

### Adding New Features

1. Create model in `internal/models/`
2. Create repository in appropriate package
3. Create service with business logic
4. Create handler for HTTP endpoints
5. Register routes in `cmd/server/routes/`
6. Add tests

## 🔒 Security Features

- ✅ **Open Redirect Prevention** - Strict URL validation for click tracking
- ✅ **Idempotency** - SNS event deduplication
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **Input Validation** - All inputs validated
- ✅ **SQL Injection Protection** - Using GORM parameterized queries

## 📊 Performance

- **Database Indexes** - Optimized for common queries
- **Caching** - Reduces database load
- **Connection Pooling** - Efficient database connections
- **Async Processing** - Email sending via worker queue

## 🧪 Testing Examples

### Create Campaign
```bash
curl -X POST http://localhost:8080/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Campaign",
    "subject": "Test Subject",
    "content": "<h1>Test</h1>",
    "from_email": "test@example.com",
    "client_id": "your-client-uuid"
  }'
```

### Send Email
```bash
curl -X POST http://localhost:8080/emails/send \
  -H "Content-Type: application/json" \
  -d '{
    "from": "sender@example.com",
    "to": ["recipient@example.com"],
    "subject": "Test Email",
    "html": "<h1>Hello</h1>"
  }'
```

### Get Analytics
```bash
curl http://localhost:8080/analytics/overview
```

## 📝 Implementation Steps

This backend was built in 12 steps:

1. **Backend Foundation** - Fiber setup, configuration
2. **PostgreSQL Setup** - Database connection, GORM
3. **Contacts CRUD** - Contact management API
4. **Email Queue** - Redis queue system
5. **Redis Queue** - Structured job format
6. **SMTP Email** - AWS SES integration
7. **Message Tracking** - SES event processing
8. **Email Tracking** - Open & click tracking
9. **SNS Webhook** - SES event webhooks
10. **Email Analytics** - Analytics dashboard API
11. **Senior Features** - Rate limiting, caching, metrics
12. **Campaign Management** - Campaign CRUD & scheduling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

[Your License Here]

## 👥 Authors

- Your Name

## 🙏 Acknowledgments

- Fiber framework
- GORM ORM
- AWS SES
- PostgreSQL
- Redis

---

**Built with ❤️ using Go**

