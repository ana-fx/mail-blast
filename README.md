# 🚀 MailBlast - Email Campaign Management System

<div align="center">

![Go Version](https://img.shields.io/badge/Go-1.23+-00ADD8?style=for-the-badge&logo=go)
![Fiber](https://img.shields.io/badge/Fiber-v2-00ADD8?style=for-the-badge&logo=go)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-316192?style=for-the-badge&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7+-DC382D?style=for-the-badge&logo=redis)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A high-performance email campaign management system built with Go, Fiber, PostgreSQL, and Redis**

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Documentation](#-documentation) • [API](#-api-endpoints)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Documentation](#-documentation)
- [Development](#-development)
- [Contributing](#-contributing)

---

## 🎯 Overview

**MailBlast** is a modern, scalable email campaign management system designed for high-throughput email delivery. Built with clean architecture principles, it provides a robust foundation for managing contacts, creating campaigns, and processing email queues asynchronously.

### Key Highlights

- ⚡ **High Performance** - Built with Go and Fiber for blazing-fast API responses
- 🏗️ **Clean Architecture** - Separation of concerns with Repository → Service → Handler layers
- 📦 **Queue-Based Processing** - Asynchronous email processing using Redis
- 🔄 **Scalable** - Worker-based architecture supports horizontal scaling
- 📚 **Well Documented** - Comprehensive documentation for each implementation step
- 🧪 **Development Ready** - Dummy email provider for testing without real email sending

---

## ✨ Features

### Core Features

- ✅ **Contacts Management** - Full CRUD operations for email contacts
- ✅ **Email Queue System** - Redis-based job queue for async processing
- ✅ **Batch Email Support** - Send emails to multiple contacts in batches
- ✅ **Template Support** - Template-based email sending (ready for implementation)
- ✅ **Client Management** - Multi-client support with isolated data
- ✅ **Health Monitoring** - Health check and database status endpoints

### Coming Soon

- 🔜 AWS SES Integration - Real email sending via Amazon SES
- 🔜 Email Templates - Dynamic template rendering
- 🔜 Campaign Management - Create and manage email campaigns
- 🔜 Analytics & Tracking - Email open rates, click tracking
- 🔜 Webhooks - SNS webhook support for bounce/complaint handling

---

## 🛠️ Tech Stack

### Backend

- **[Go 1.23+](https://go.dev/)** - Programming language
- **[Fiber v2](https://gofiber.io/)** - Express-inspired web framework
- **[GORM](https://gorm.io/)** - ORM for database operations
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[Redis](https://redis.io/)** - Queue and caching layer
- **[AWS SDK v2](https://aws.github.io/aws-sdk-go-v2/)** - AWS services integration (SES ready)

### Tools & Libraries

- `github.com/joho/godotenv` - Environment configuration
- `github.com/google/uuid` - UUID generation
- `github.com/redis/go-redis/v9` - Redis client

---

## 🏗️ Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────┐
│         HTTP Layer (Fiber)          │
│         Handlers & Routes            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Service Layer (Business Logic)   │
│      Validation & Business Rules      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Repository Layer (Data Access)   │
│         GORM & Database              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Infrastructure               │
│    PostgreSQL | Redis | AWS SES      │
└──────────────────────────────────────┘
```

### System Flow

```
Client Request
    ↓
HTTP Server (Fiber)
    ↓
Handler → Service → Repository
    ↓
Database (PostgreSQL)
    ↓
Queue (Redis) → Worker → Email Provider
```

---

## 🚀 Quick Start

### Prerequisites

- Go 1.23 or higher
- PostgreSQL 12+
- Redis 7+
- Git

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/ana-fx/mail-blast.git
cd mail-blast
```

2. **Navigate to backend**

```bash
cd backend
```

3. **Install dependencies**

```bash
go mod download
```

4. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Set up database**

```bash
# Create database
createdb mydb

# Or using psql
psql -U postgres -c "CREATE DATABASE mydb;"
```

6. **Start Redis**

```bash
# macOS (Homebrew)
brew services start redis

# Linux
redis-server

# Docker
docker run -d -p 6379:6379 redis:7
```

7. **Run the server**

```bash
go run cmd/server/main.go
```

8. **Run the worker** (in separate terminal)

```bash
go run cmd/server/main.go
```

### Verify Installation

```bash
# Health check
curl http://localhost:8080/health

# Database check
curl http://localhost:8080/db-check
```

---

## 📁 Project Structure

```
mail-blast/
├── backend/
│   ├── cmd/
│   │   ├── server/          # HTTP API server
│   │   │   └── main.go
│   │   └── worker/          # Queue worker
│   │       └── main.go
│   ├── internal/
│   │   ├── config/          # Configuration loader
│   │   ├── db/              # Database connection
│   │   ├── models/          # Data models
│   │   ├── contacts/        # Contacts module
│   │   │   ├── handler.go
│   │   │   ├── service.go
│   │   │   └── repository.go
│   │   ├── queue/           # Redis queue
│   │   │   ├── redis.go
│   │   │   └── job.go
│   │   ├── email/           # Email providers
│   │   │   ├── dummy.go
│   │   │   └── job.go
│   │   ├── handlers/        # HTTP handlers
│   │   └── webhooks/        # Webhook handlers
│   ├── documentation/       # Step-by-step docs
│   │   ├── step1-backend-foundation.md
│   │   ├── step2-postgresql-setup.md
│   │   ├── step3-contacts-crud.md
│   │   ├── step4-email-queue.md
│   │   └── step5-redis-queue.md
│   ├── go.mod
│   ├── go.sum
│   └── .env.example
└── README.md
```

---

## 🔌 API Endpoints

### Health & Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/db-check` | Database connection status |

### Contacts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/contacts` | Create contact |
| `GET` | `/contacts` | List all contacts |
| `GET` | `/contacts/:id` | Get contact by ID |
| `PUT` | `/contacts/:id` | Update contact |
| `DELETE` | `/contacts/:id` | Delete contact |

### Email Queue

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/queue/test` | Queue test email job |
| `POST` | `/send-email` | Queue email (legacy) |

### Example Requests

**Create Contact:**
```bash
curl -X POST http://localhost:8080/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

**Queue Email Job:**
```bash
curl -X POST http://localhost:8080/queue/test
```

---

## 📚 Documentation

Comprehensive step-by-step documentation is available in the `backend/documentation/` directory:

- **[Step 1: Backend Foundation](backend/documentation/step1-backend-foundation.md)** - Initial setup with Fiber
- **[Step 2: PostgreSQL Setup](backend/documentation/step2-postgresql-setup.md)** - Database integration with GORM
- **[Step 3: Contacts CRUD](backend/documentation/step3-contacts-crud.md)** - Contact management API
- **[Step 4: Email Queue](backend/documentation/step4-email-queue.md)** - Basic email queue system
- **[Step 5: Redis Queue](backend/documentation/step5-redis-queue.md)** - Advanced queue with batch support

Each document includes:
- Architecture overview
- Component details
- Code examples
- Testing instructions
- Error handling

---

## 💻 Development

### Running in Development

```bash
# Terminal 1: Start server
cd backend
go run cmd/server/main.go

# Terminal 2: Start worker
cd backend
go run cmd/worker/main.go
```

### Building

```bash
# Build server
go build -o bin/server ./cmd/server

# Build worker
go build -o bin/worker ./cmd/worker
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
APP_PORT=8080
DATABASE_URL=postgres://user:password@localhost:5432/mydb?sslmode=disable
REDIS_ADDR=localhost:6379
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

### Testing

```bash
# Run all tests (when available)
go test ./...

# Test specific package
go test ./internal/contacts/...
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow Go best practices and conventions
- Write clear commit messages
- Add documentation for new features
- Ensure code builds without errors
- Test your changes thoroughly

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Fiber](https://gofiber.io/) - Fast HTTP framework
- [GORM](https://gorm.io/) - Fantastic ORM library
- [Redis](https://redis.io/) - In-memory data structure store
- [PostgreSQL](https://www.postgresql.org/) - Advanced open-source database

---

## 📧 Contact

Project Link: [https://github.com/ana-fx/mail-blast](https://github.com/ana-fx/mail-blast)

---

<div align="center">

**Made with ❤️ using Go**

⭐ Star this repo if you find it helpful!

</div>

