-- =====================================================
-- MailBlast Complete Database Schema
-- =====================================================
-- This file contains all database tables, indexes, and constraints
-- Run this file once to set up the complete database schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table: clients
-- Stores client information
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for clients
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);

-- =====================================================
-- Table: contacts
-- Stores email contacts
-- =====================================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contacts_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Indexes for contacts
CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- Unique constraint: one email per client
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_client_email_unique ON contacts(client_id, email);

-- =====================================================
-- Table: email_messages
-- Stores every email sent
-- =====================================================
CREATE TABLE IF NOT EXISTS email_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id TEXT NOT NULL,
    from_email TEXT NOT NULL,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'queued',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for email_messages
CREATE INDEX IF NOT EXISTS idx_email_messages_message_id ON email_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_status ON email_messages(status);
CREATE INDEX IF NOT EXISTS idx_email_messages_to_email ON email_messages(to_email);
CREATE INDEX IF NOT EXISTS idx_email_messages_from_email ON email_messages(from_email);
CREATE INDEX IF NOT EXISTS idx_email_messages_created_at ON email_messages(created_at);

-- Unique constraint: message_id should be unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_messages_message_id_unique ON email_messages(message_id);

-- =====================================================
-- Table: email_events
-- Stores email events (sent, delivered, open, click, bounce)
-- =====================================================
CREATE TABLE IF NOT EXISTS email_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    meta JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_email_events_email FOREIGN KEY (email_id) REFERENCES email_messages(id) ON DELETE CASCADE
);

-- Indexes for email_events
CREATE INDEX IF NOT EXISTS idx_email_events_email_id ON email_events(email_id);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON email_events(created_at);

-- Composite index for common queries (email_id + event_type)
CREATE INDEX IF NOT EXISTS idx_email_events_email_type ON email_events(email_id, event_type);

-- =====================================================
-- Table: users
-- Stores system users (admin, client users, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    client_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- Indexes for users
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_client_id ON users(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- =====================================================
-- Table: campaigns
-- Stores email campaign information
-- =====================================================
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    text_content TEXT,
    from_email TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    send_at TIMESTAMP,
    client_id UUID NOT NULL,
    template_id UUID,
    recipient_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_campaigns_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Indexes for campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_client_id ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_send_at ON campaigns(send_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_template_id ON campaigns(template_id) WHERE template_id IS NOT NULL;

-- Composite index for scheduled campaigns query
CREATE INDEX IF NOT EXISTS idx_campaigns_status_send_at ON campaigns(status, send_at) WHERE status = 'scheduled' AND send_at IS NOT NULL;

-- =====================================================
-- Idempotency Indexes
-- =====================================================

-- Add unique index for SNS Message ID to ensure idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_events_unique_sns
ON email_events ((meta->>'sns_message_id'))
WHERE meta->>'sns_message_id' IS NOT NULL;

-- Add index for email_id, event_type, and created_at for efficient querying of open/click events
CREATE INDEX IF NOT EXISTS idx_email_events_email_id_type_created
ON email_events (email_id, event_type, created_at DESC);

-- Add index for email_id, event_type, and URL for efficient querying of click events
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_events_email_id_type_url
ON email_events (email_id, event_type, (meta->>'url'))
WHERE event_type = 'click' AND meta->>'url' IS NOT NULL;

-- =====================================================
-- Comments for documentation
-- =====================================================
COMMENT ON TABLE users IS 'Stores system users (admin, client users, etc.)';
COMMENT ON TABLE clients IS 'Stores client information and sender email configuration';
COMMENT ON TABLE contacts IS 'Stores email contacts with status (active, unsubscribed, bounced)';
COMMENT ON TABLE email_messages IS 'Stores every email sent with tracking information';
COMMENT ON TABLE email_events IS 'Stores email events: sent, delivered, open, click, bounce';
COMMENT ON TABLE campaigns IS 'Stores email campaign information with scheduling support';

COMMENT ON COLUMN users.email IS 'User email address (unique)';
COMMENT ON COLUMN users.password IS 'Hashed password (never exposed in API)';
COMMENT ON COLUMN users.role IS 'User role: admin, user, client';
COMMENT ON COLUMN users.status IS 'User status: active, inactive, suspended';
COMMENT ON COLUMN users.client_id IS 'Optional link to client (for client users)';
COMMENT ON COLUMN contacts.status IS 'Contact status: active, unsubscribed, bounced';
COMMENT ON COLUMN email_messages.status IS 'Email status: queued, sent, failed';
COMMENT ON COLUMN email_messages.message_id IS 'Unique Message-ID header from email';
COMMENT ON COLUMN email_events.event_type IS 'Event type: sent, delivered, open, click, bounce, failed';
COMMENT ON COLUMN email_events.meta IS 'JSON metadata for event (error details, user agent, IP, etc.)';
COMMENT ON COLUMN campaigns.status IS 'Campaign status: draft, scheduled, sending, sent, failed';
COMMENT ON COLUMN campaigns.send_at IS 'Scheduled send time (NULL for immediate send)';
COMMENT ON COLUMN campaigns.recipient_count IS 'Number of recipients for this campaign';

-- =====================================================
-- Migration complete
-- =====================================================

