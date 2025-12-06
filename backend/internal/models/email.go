package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// EmailMessageRecord represents an email message in the database
type EmailMessageRecord struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	MessageID string    `gorm:"type:text;not null" json:"message_id"`
	From      string    `gorm:"type:text;not null;column:from_email" json:"from_email"`
	To        string    `gorm:"type:text;not null;column:to_email" json:"to_email"`
	Subject   string    `gorm:"type:text;not null" json:"subject"`
	Status    string    `gorm:"type:text;not null;default:'queued'" json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName specifies the table name for GORM
func (EmailMessageRecord) TableName() string {
	return "email_messages"
}

// EmailEventRecord represents an email event in the database
type EmailEventRecord struct {
	ID        uuid.UUID       `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	EmailID   uuid.UUID       `gorm:"type:uuid;not null" json:"email_id"`
	EventType string          `gorm:"type:text;not null" json:"event_type"`
	Meta      json.RawMessage `gorm:"type:jsonb" json:"meta"`
	CreatedAt time.Time       `json:"created_at"`
}

// TableName specifies the table name for GORM
func (EmailEventRecord) TableName() string {
	return "email_events"
}
