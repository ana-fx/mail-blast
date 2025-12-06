# Database Migrations

This directory contains SQL migration files for the MailBlast database schema.

## Production Deployment

### Option 1: Run Complete Migration (Recommended)

Run the complete schema file once:

```bash
psql -U your_user -d your_database -f migrations/001_initial_schema.sql
```

Or using connection string:

```bash
psql $DATABASE_URL -f migrations/001_initial_schema.sql
```

### Option 2: Run Individual Migrations

If you need to run migrations incrementally:

```bash
# Run in order
psql $DATABASE_URL -f migrations/001_initial_schema.sql
```

## Migration Files

- **001_initial_schema.sql** - Complete database schema (all tables, indexes, constraints)

## What's Included

### Tables
- `clients` - Client information
- `contacts` - Email contacts
- `email_messages` - Email tracking
- `email_events` - Email events (sent, open, click, bounce)

### Features
- UUID primary keys
- Foreign key constraints
- Indexes for performance
- Unique constraints
- JSONB for metadata
- Timestamps (created_at, updated_at)

## Verification

After running migrations, verify tables exist:

```sql
\dt
```

Check indexes:

```sql
\di
```

## Rollback

To rollback (drop all tables):

```sql
DROP TABLE IF EXISTS email_events CASCADE;
DROP TABLE IF EXISTS email_messages CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP EXTENSION IF EXISTS "uuid-ossp";
```

## Notes

- All migrations are idempotent (safe to run multiple times)
- Uses `IF NOT EXISTS` to prevent errors on re-run
- Foreign keys use `ON DELETE CASCADE` for data integrity

