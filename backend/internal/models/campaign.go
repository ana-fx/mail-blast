package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Campaign represents an email campaign
type Campaign struct {
	ID             uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Title          string     `gorm:"type:varchar(255);not null" json:"title"`
	Subject        string     `gorm:"type:text;not null" json:"subject"`
	Content        string     `gorm:"type:text;not null" json:"content"` // HTML content
	TextContent    string     `gorm:"type:text" json:"text_content"`     // Plain text version
	FromEmail      string     `gorm:"type:text;not null" json:"from_email"`
	Status         string     `gorm:"type:varchar(50);not null;default:'draft'" json:"status"` // draft, scheduled, sending, sent, failed
	SendAt         *time.Time `gorm:"type:timestamp" json:"send_at,omitempty"`                 // null for immediate send
	ClientID       uuid.UUID  `gorm:"type:uuid;not null" json:"client_id"`
	TemplateID     *uuid.UUID `gorm:"type:uuid" json:"template_id,omitempty"` // Optional template reference
	RecipientCount int        `gorm:"default:0" json:"recipient_count"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

// BeforeCreate hook to generate UUID if not set
func (c *Campaign) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name for Campaign
func (Campaign) TableName() string {
	return "campaigns"
}
