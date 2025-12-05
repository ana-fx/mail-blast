package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Client struct {
	ID          uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Name        string    `json:"name"`
	SenderEmail string    `json:"sender_email"` // will be configured later
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// BeforeCreate hook to generate UUID if not set
func (c *Client) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

