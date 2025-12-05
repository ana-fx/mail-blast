# Step 3: Contacts CRUD API

## Overview

Contacts CRUD API allows you to manage email contacts in the MailBlast system. This feature enables creating, reading, updating, and deleting contacts for email campaigns.

## Architecture

This feature implements **Clean Architecture** with clear layer separation:

```
Handler (HTTP Layer)
    ↓
Service (Business Logic Layer)
    ↓
Repository (Data Access Layer)
    ↓
Database (PostgreSQL via GORM)
```

### Components

- **Model** - Defines Contact data structure with UUID primary key
- **Repository** - Handles database operations using GORM
- **Service** - Contains business logic and validation
- **Handler** - Manages HTTP requests and responses

## Data Model

```go
type Contact struct {
    ID        uuid.UUID  // Primary key, auto-generated
    ClientID  uuid.UUID  // Foreign key to Client
    Name      string     // Contact name
    Email     string     // Email address
    Status    string     // active, unsubscribed, or bounced
    CreatedAt time.Time  // Creation timestamp
    UpdatedAt time.Time  // Last update timestamp
}
```

**Status Values:**
- `active` - Contact is active (default)
- `unsubscribed` - Contact has unsubscribed
- `bounced` - Email bounced

## API Endpoints

### 1. Create Contact

**POST** `/contacts`

Creates a new contact.

**Request:**
```json
{
  "client_id": "uuid",
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "client_id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "status": "active",
  "created_at": "2025-12-06T03:00:00Z",
  "updated_at": "2025-12-06T03:00:00Z"
}
```

**How it works:**
1. Validates required fields (name, email, client_id)
2. Validates email format
3. Sets default status to "active"
4. Saves to database
5. Returns created contact

---

### 2. List All Contacts

**GET** `/contacts`

Retrieves all contacts.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "client_id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "active",
    "created_at": "2025-12-06T03:00:00Z",
    "updated_at": "2025-12-06T03:00:00Z"
  }
]
```

**How it works:**
1. Queries all contacts from database
2. Returns array of contacts

---

### 3. Get Contact by ID

**GET** `/contacts/:id`

Retrieves a specific contact by ID.

**Response (200):**
```json
{
  "id": "uuid",
  "client_id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "status": "active",
  "created_at": "2025-12-06T03:00:00Z",
  "updated_at": "2025-12-06T03:00:00Z"
}
```

**How it works:**
1. Validates UUID format
2. Queries database by ID
3. Returns contact if found

**Errors:**
- `400` - Invalid ID format
- `404` - Contact not found

---

### 4. Update Contact

**PUT** `/contacts/:id`

Updates an existing contact. All fields are optional.

**Request:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "status": "unsubscribed"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "client_id": "uuid",
  "name": "John Updated",
  "email": "john.updated@example.com",
  "status": "unsubscribed",
  "created_at": "2025-12-06T03:00:00Z",
  "updated_at": "2025-12-06T03:05:00Z"
}
```

**How it works:**
1. Validates ID format
2. Checks if contact exists
3. Validates email if provided
4. Updates only provided fields
5. Saves to database
6. Returns updated contact

**Errors:**
- `400` - Invalid ID or email format
- `404` - Contact not found

---

### 5. Delete Contact

**DELETE** `/contacts/:id`

Deletes a contact from the system.

**Response (200):**
```json
{
  "message": "contact deleted successfully"
}
```

**How it works:**
1. Validates ID format
2. Checks if contact exists
3. Deletes from database
4. Returns success message

**Errors:**
- `400` - Invalid ID format
- `404` - Contact not found

---

## Business Logic

### Email Validation

Validates email format:
- Must contain `@`
- Local part (before @) cannot be empty
- Domain (after @) cannot be empty
- Domain must contain at least one dot

### Default Status

New contacts automatically get `"active"` status if not specified.

### UUID Generation

Contact IDs are auto-generated using UUID v4 by PostgreSQL or GORM hooks.

---

## Error Responses

All errors return JSON format:

```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

---

## Database

The `contacts` table is auto-created via GORM migrations:

- Primary key: `id` (UUID)
- Foreign key: `client_id` (UUID)
- Fields: `name`, `email`, `status`
- Timestamps: `created_at`, `updated_at`

---

## Integration

- Registered routes in `cmd/server/main.go`
- Uses PostgreSQL with UUID extension
- Requires valid `client_id` from Client model
