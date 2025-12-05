package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Contact struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	ClientID  uuid.UUID `gorm:"type:uuid" json:"client_id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Status    string    `json:"status"` // active, unsubscribed, bounced
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// BeforeCreate hook to generate UUID if not set
func (c *Contact) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}
