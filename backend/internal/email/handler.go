package email

import (
	"fmt"
	"os"
	"strings"
	"time"

	"backend/internal/models"
	"backend/internal/repositories"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/rs/zerolog"
)

// SendEmailHandler handles email sending requests
type SendEmailHandler struct {
	queue     *Queue
	emailRepo repositories.EmailRepository
	logger    zerolog.Logger
}

// NewSendEmailHandler creates a new email sending handler
func NewSendEmailHandler(queue *Queue, emailRepo repositories.EmailRepository) *SendEmailHandler {
	return &SendEmailHandler{
		queue:     queue,
		emailRepo: emailRepo,
		logger:    zerolog.New(os.Stdout).With().Timestamp().Logger(),
	}
}

// SendEmailRequest represents the request body
type SendEmailRequest struct {
	From   string   `json:"from"`
	To     []string `json:"to"`
	Subject string  `json:"subject"`
	HTML   string   `json:"html"`
	Text   string   `json:"text"`
}

// SendEmailResponse represents the response
type SendEmailResponse struct {
	Status     string   `json:"status"`
	Queued     int      `json:"queued"`
	MessageIDs []string `json:"message_ids"`
}

// HandleSendEmail handles POST /emails/send
func (h *SendEmailHandler) HandleSendEmail(c *fiber.Ctx) error {
	var req SendEmailRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate input
	if err := h.validateRequest(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	ctx := c.Context()
	messageIDs := []string{}
	queuedCount := 0

	// Process each recipient
	for _, recipient := range req.To {
		// Generate unique Message-ID
		messageID := h.generateMessageID(req.From)

		// Create email record
		emailRecord := models.EmailMessageRecord{
			ID:        uuid.New(),
			MessageID: messageID,
			From:      req.From,
			To:        recipient,
			Subject:   req.Subject,
			Status:    "queued",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		// Insert into database
		if err := h.emailRepo.CreateEmailMessage(ctx, emailRecord); err != nil {
			h.logger.Error().
				Err(err).
				Str("recipient", recipient).
				Msg("Failed to create email record")
			continue
		}

		// Create email job
		job := SendEmailJob{
			EmailRecord: &emailRecord,
			From:        req.From,
			To:          recipient,
			Subject:     req.Subject,
			HTMLBody:    req.HTML,
			TextBody:    req.Text,
		}

		// Enqueue job
		if err := h.queue.Enqueue(job); err != nil {
			h.logger.Error().
				Err(err).
				Str("recipient", recipient).
				Msg("Failed to enqueue email job")
			// Update status to failed
			h.emailRepo.UpdateEmailStatus(ctx, emailRecord.ID, "failed")
			continue
		}

		messageIDs = append(messageIDs, messageID)
		queuedCount++

		h.logger.Info().
			Str("event", "email.queued").
			Str("message_id", messageID).
			Str("to", recipient).
			Str("subject", req.Subject).
			Msg("Email queued for sending")
	}

	// Return response
	response := SendEmailResponse{
		Status:     "ok",
		Queued:     queuedCount,
		MessageIDs: messageIDs,
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

// validateRequest validates the send email request
func (h *SendEmailHandler) validateRequest(req *SendEmailRequest) error {
	// Validate to[] cannot be empty
	if len(req.To) == 0 {
		return fmt.Errorf("to[] cannot be empty")
	}

	// Validate from must be a valid email
	if req.From == "" {
		return fmt.Errorf("from is required")
	}
	if !isValidEmail(req.From) {
		return fmt.Errorf("from must be a valid email address")
	}

	// Validate subject required
	if req.Subject == "" {
		return fmt.Errorf("subject is required")
	}

	// Validate html OR text required
	if req.HTML == "" && req.Text == "" {
		return fmt.Errorf("html or text is required")
	}

	// Validate each recipient email
	for _, email := range req.To {
		if !isValidEmail(email) {
			return fmt.Errorf("invalid email address in to[]: %s", email)
		}
	}

	return nil
}

// generateMessageID generates a unique RFC-compliant Message-ID
func (h *SendEmailHandler) generateMessageID(from string) string {
	// Extract domain from from address
	domain := "mailer.local"
	if idx := strings.LastIndex(from, "@"); idx != -1 {
		domain = from[idx+1:]
	}

	// Generate UUID for unique part
	uniqueID := uuid.New().String()

	// Format: <unique-id@domain>
	return fmt.Sprintf("<%s@%s>", uniqueID, domain)
}

// isValidEmail performs basic email validation
func isValidEmail(email string) bool {
	if email == "" {
		return false
	}

	email = strings.TrimSpace(email)

	// Basic validation: must contain @ and at least one dot after @
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return false
	}

	if len(parts[0]) == 0 || len(parts[1]) == 0 {
		return false
	}

	// Check for at least one dot in domain
	if !strings.Contains(parts[1], ".") {
		return false
	}

	return true
}

