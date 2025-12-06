package repositories

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"backend/internal/db"
	"backend/internal/models"

	"github.com/google/uuid"
)

type EmailRepository interface {
	CreateEmailMessage(ctx context.Context, msg models.EmailMessageRecord) error
	UpdateEmailStatus(ctx context.Context, id uuid.UUID, status string) error
	AddEmailEvent(ctx context.Context, event models.EmailEventRecord) error
	GetEmailByMessageID(ctx context.Context, messageID string) (*models.EmailMessageRecord, error)
	CreateEmailEventWithMeta(ctx context.Context, emailID uuid.UUID, eventType string, meta map[string]interface{}) error
	CheckSNSMessageIdExists(ctx context.Context, snsMessageId string) (bool, error)
	CheckOpenEventExistsToday(ctx context.Context, emailID uuid.UUID) (bool, error)
	CheckClickEventExists(ctx context.Context, emailID uuid.UUID, targetURL string) (bool, error)
}

type emailRepository struct{}

// EmailRepositoryImpl is the concrete implementation (exported for type assertion)
type EmailRepositoryImpl struct {
	emailRepository
}

// NewEmailRepository creates a new email repository
func NewEmailRepository() EmailRepository {
	return &EmailRepositoryImpl{}
}

// CreateEmailMessage creates a new email message record
func (r *emailRepository) CreateEmailMessage(ctx context.Context, msg models.EmailMessageRecord) error {
	if err := db.DB.WithContext(ctx).Create(&msg).Error; err != nil {
		return fmt.Errorf("failed to create email message: %w", err)
	}
	return nil
}

// UpdateEmailStatus updates the status of an email message
func (r *emailRepository) UpdateEmailStatus(ctx context.Context, id uuid.UUID, status string) error {
	result := db.DB.WithContext(ctx).Model(&models.EmailMessageRecord{}).
		Where("id = ?", id).
		Update("status", status)

	if result.Error != nil {
		return fmt.Errorf("failed to update email status: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("email message not found: %s", id)
	}
	return nil
}

// AddEmailEvent adds an email event record
func (r *emailRepository) AddEmailEvent(ctx context.Context, event models.EmailEventRecord) error {
	if err := db.DB.WithContext(ctx).Create(&event).Error; err != nil {
		return fmt.Errorf("failed to create email event: %w", err)
	}
	return nil
}

// GetEmailByMessageID retrieves an email message by Message-ID
func (r *emailRepository) GetEmailByMessageID(ctx context.Context, messageID string) (*models.EmailMessageRecord, error) {
	var msg models.EmailMessageRecord
	if err := db.DB.WithContext(ctx).Where("message_id = ?", messageID).First(&msg).Error; err != nil {
		return nil, fmt.Errorf("failed to get email by message ID: %w", err)
	}
	return &msg, nil
}

// CreateEmailEventWithMeta is a helper to create event with metadata map
func (r *emailRepository) CreateEmailEventWithMeta(ctx context.Context, emailID uuid.UUID, eventType string, meta map[string]interface{}) error {
	var metaJSON json.RawMessage
	var err error

	if meta != nil {
		metaJSON, err = json.Marshal(meta)
		if err != nil {
			return fmt.Errorf("failed to marshal metadata: %w", err)
		}
	}

	event := models.EmailEventRecord{
		EmailID:   emailID,
		EventType: eventType,
		Meta:      metaJSON,
		CreatedAt: time.Now(),
	}

	return r.AddEmailEvent(ctx, event)
}

// CheckSNSMessageIdExists checks if an event with the given SNS MessageId already exists
func (r *emailRepository) CheckSNSMessageIdExists(ctx context.Context, snsMessageId string) (bool, error) {
	var count int64
	err := db.DB.WithContext(ctx).
		Model(&models.EmailEventRecord{}).
		Where("meta->>'sns_message_id' = ?", snsMessageId).
		Count(&count).Error
	if err != nil {
		return false, fmt.Errorf("failed to check SNS message ID: %w", err)
	}
	return count > 0, nil
}

// CheckOpenEventExistsToday checks if an open event already exists for this email today
func (r *emailRepository) CheckOpenEventExistsToday(ctx context.Context, emailID uuid.UUID) (bool, error) {
	var count int64
	err := db.DB.WithContext(ctx).
		Model(&models.EmailEventRecord{}).
		Where("email_id = ? AND event_type = ? AND DATE(created_at) = CURRENT_DATE", emailID, "open").
		Count(&count).Error
	if err != nil {
		return false, fmt.Errorf("failed to check open event: %w", err)
	}
	return count > 0, nil
}

// CheckClickEventExists checks if a click event already exists for this email and URL
func (r *emailRepository) CheckClickEventExists(ctx context.Context, emailID uuid.UUID, targetURL string) (bool, error) {
	var count int64
	err := db.DB.WithContext(ctx).
		Model(&models.EmailEventRecord{}).
		Where("email_id = ? AND event_type = ? AND meta->>'url' = ?", emailID, "click", targetURL).
		Count(&count).Error
	if err != nil {
		return false, fmt.Errorf("failed to check click event: %w", err)
	}
	return count > 0, nil
}
