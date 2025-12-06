package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"backend/internal/models"
	"backend/internal/repositories"

	"github.com/google/uuid"
)

type TrackingService struct {
	repo repositories.EmailRepository
}

// NewTrackingService creates a new tracking service
func NewTrackingService(repo repositories.EmailRepository) *TrackingService {
	return &TrackingService{
		repo: repo,
	}
}

// RecordEvent records an email event by Message-ID
func (ts *TrackingService) RecordEvent(ctx context.Context, messageID, eventType string, meta map[string]interface{}) error {
	// Fetch email by message_id
	email, err := ts.repo.GetEmailByMessageID(ctx, messageID)
	if err != nil {
		return fmt.Errorf("failed to get email by message ID: %w", err)
	}
	if email == nil {
		return fmt.Errorf("email not found for message ID: %s", messageID)
	}

	// Marshal metadata to JSON
	var metaJSON json.RawMessage
	if meta != nil {
		metaJSONBytes, err := json.Marshal(meta)
		if err != nil {
			return fmt.Errorf("failed to marshal metadata: %w", err)
		}
		metaJSON = metaJSONBytes
	}

	// Create event record
	event := models.EmailEventRecord{
		ID:        uuid.New(),
		EmailID:   email.ID,
		EventType: eventType,
		Meta:      metaJSON,
		CreatedAt: time.Now(),
	}

	return ts.repo.AddEmailEvent(ctx, event)
}

// RecordEventWithEmailID records an event with direct email ID
func (ts *TrackingService) RecordEventWithEmailID(ctx context.Context, emailID uuid.UUID, eventType string, meta map[string]interface{}) error {
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
	}

	return ts.repo.AddEmailEvent(ctx, event)
}
