package tracking

import (
	"context"
	"errors"
	"testing"
	"time"

	"backend/internal/models"
	"backend/internal/types"

	"github.com/google/uuid"
)

// MockEmailRepository is a simple mock implementation of EmailRepository for testing
type MockEmailRepository struct {
	emails              map[string]*models.EmailMessageRecord
	snsMessageIds       map[string]bool
	openEventsToday     map[uuid.UUID]bool
	clickEvents         map[string]bool // key: emailID + "|" + url
	createEventCalled   bool
	updateStatusCalled  bool
}

func NewMockEmailRepository() *MockEmailRepository {
	return &MockEmailRepository{
		emails:          make(map[string]*models.EmailMessageRecord),
		snsMessageIds:   make(map[string]bool),
		openEventsToday: make(map[uuid.UUID]bool),
		clickEvents:     make(map[string]bool),
	}
}

func (m *MockEmailRepository) CreateEmailMessage(ctx context.Context, msg models.EmailMessageRecord) error {
	m.emails[msg.MessageID] = &msg
	return nil
}

func (m *MockEmailRepository) UpdateEmailStatus(ctx context.Context, id uuid.UUID, status string) error {
	m.updateStatusCalled = true
	return nil
}

func (m *MockEmailRepository) AddEmailEvent(ctx context.Context, event models.EmailEventRecord) error {
	m.createEventCalled = true
	return nil
}

func (m *MockEmailRepository) GetEmailByMessageID(ctx context.Context, messageID string) (*models.EmailMessageRecord, error) {
	if email, ok := m.emails[messageID]; ok {
		return email, nil
	}
	return nil, errors.New("email not found")
}

func (m *MockEmailRepository) CreateEmailEventWithMeta(ctx context.Context, emailID uuid.UUID, eventType string, meta map[string]interface{}) error {
	m.createEventCalled = true
	return nil
}

func (m *MockEmailRepository) CheckSNSMessageIdExists(ctx context.Context, snsMessageId string) (bool, error) {
	return m.snsMessageIds[snsMessageId], nil
}

func (m *MockEmailRepository) CheckOpenEventExistsToday(ctx context.Context, emailID uuid.UUID) (bool, error) {
	return m.openEventsToday[emailID], nil
}

func (m *MockEmailRepository) CheckClickEventExists(ctx context.Context, emailID uuid.UUID, targetURL string) (bool, error) {
	key := emailID.String() + "|" + targetURL
	return m.clickEvents[key], nil
}

func TestProcessOpenEvent_DuplicateSkip(t *testing.T) {
	ctx := context.Background()
	mockRepo := NewMockEmailRepository()
	tracker := NewMessageTracker(mockRepo)

	emailID := uuid.New()
	email := &models.EmailMessageRecord{
		ID:        emailID,
		MessageID: "test-message-id",
	}

	// Setup: email exists
	mockRepo.emails["test-message-id"] = email

	// Setup: open event already exists today
	mockRepo.openEventsToday[emailID] = true

	// Reset flag
	mockRepo.createEventCalled = false

	// Should not call CreateEmailEventWithMeta
	err := tracker.ProcessOpenEvent(ctx, "test-message-id")

	if err != nil {
		t.Errorf("Expected no error, got: %v", err)
	}
	if mockRepo.createEventCalled {
		t.Error("Expected CreateEmailEventWithMeta to NOT be called for duplicate event")
	}
}

func TestProcessClickEvent_DuplicateSkip(t *testing.T) {
	ctx := context.Background()
	mockRepo := NewMockEmailRepository()
	tracker := NewMessageTracker(mockRepo)

	emailID := uuid.New()
	email := &models.EmailMessageRecord{
		ID:        emailID,
		MessageID: "test-message-id",
	}
	targetURL := "https://example.com"

	// Setup: email exists
	mockRepo.emails["test-message-id"] = email

	// Setup: click event already exists for this URL
	key := emailID.String() + "|" + targetURL
	mockRepo.clickEvents[key] = true

	// Reset flag
	mockRepo.createEventCalled = false

	// Should not call CreateEmailEventWithMeta
	err := tracker.ProcessClickEvent(ctx, "test-message-id", targetURL)

	if err != nil {
		t.Errorf("Expected no error, got: %v", err)
	}
	if mockRepo.createEventCalled {
		t.Error("Expected CreateEmailEventWithMeta to NOT be called for duplicate event")
	}
}

func TestProcessDeliveryEvent_SNSIdempotency(t *testing.T) {
	ctx := context.Background()
	mockRepo := NewMockEmailRepository()
	tracker := NewMessageTracker(mockRepo)

	emailID := uuid.New()
	email := &models.EmailMessageRecord{
		ID:        emailID,
		MessageID: "test-message-id",
	}
	snsMessageId := "sns-123-456"

	// Setup: email exists
	mockRepo.emails["test-message-id"] = email

	// Setup: SNS MessageId already exists
	mockRepo.snsMessageIds[snsMessageId] = true

	// Reset flag
	mockRepo.createEventCalled = false

	// Should not call CreateEmailEventWithMeta
	delivery := &types.SESDelivery{
		Recipients: []string{"test@example.com"},
		Timestamp:  time.Now().Format(time.RFC3339),
	}
	mail := types.SESMail{
		MessageID: "ses-internal-id",
		Headers: []types.SESHeader{
			{Name: "Message-ID", Value: "<test-message-id>"},
		},
	}

	err := tracker.ProcessDeliveryEvent(ctx, delivery, mail, snsMessageId)

	if err != nil {
		t.Errorf("Expected no error, got: %v", err)
	}
	if mockRepo.createEventCalled {
		t.Error("Expected CreateEmailEventWithMeta to NOT be called for duplicate SNS event")
	}
}

