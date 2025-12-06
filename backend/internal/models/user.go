package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a system user (admin, client user, etc.)
type User struct {
	ID        uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Email     string     `gorm:"type:varchar(255);not null;uniqueIndex" json:"email"`
	Password  string     `gorm:"type:varchar(255);not null" json:"-"` // Hidden from JSON
	Name      string     `gorm:"type:varchar(255);not null" json:"name"`
	Role      string     `gorm:"type:varchar(50);not null;default:'user'" json:"role"`     // admin, user, client
	ClientID  *uuid.UUID `gorm:"type:uuid" json:"client_id,omitempty"`                     // Optional: link to client
	Status    string     `gorm:"type:varchar(50);not null;default:'active'" json:"status"` // active, inactive, suspended
	LastLogin *time.Time `gorm:"type:timestamp" json:"last_login,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

// BeforeCreate hook to generate UUID if not set
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name for User
func (User) TableName() string {
	return "users"
}
