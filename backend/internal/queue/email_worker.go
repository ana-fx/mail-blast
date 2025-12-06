package queue

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"backend/internal/config"
	"backend/internal/mail"
	"backend/internal/metrics"
	"backend/internal/models"
	"backend/internal/repositories"

	"github.com/google/uuid"
	"github.com/rs/zerolog"
)

// EmailWorker processes email jobs from the queue
type EmailWorker struct {
	smtpSender mail.SMTPSender
	emailRepo  repositories.EmailRepository
	logger     zerolog.Logger
}

// NewEmailWorker creates a new email worker
func NewEmailWorker() (*EmailWorker, error) {
	// Load SMTP config
	smtpConfig, err := config.LoadSMTPConfig()
	if err != nil {
		return nil, fmt.Errorf("failed to load SMTP config: %w", err)
	}

	// Create SMTP sender
	sender := mail.NewSMTPSender(smtpConfig)

	// Create email repository
	emailRepo := repositories.NewEmailRepository()

	return &EmailWorker{
		smtpSender: sender,
		emailRepo:  emailRepo,
		logger:     zerolog.New(os.Stdout).With().Timestamp().Logger(),
	}, nil
}

// EmailJobPayload represents the payload for send_email job
type EmailJobPayload struct {
	Email   string `json:"email"`
	Subject string `json:"subject"`
	HTML    string `json:"html"`
}

// ProcessEmailJob processes an email job
func (w *EmailWorker) ProcessEmailJob(ctx context.Context, jobType string, payload []byte) error {
	if jobType != "send_email" {
		return fmt.Errorf("unknown job type: %s", jobType)
	}

	// Parse payload
	var jobPayload EmailJobPayload
	if err := json.Unmarshal(payload, &jobPayload); err != nil {
		return fmt.Errorf("failed to unmarshal job payload: %w", err)
	}

	// Validate payload
	if jobPayload.Email == "" {
		return fmt.Errorf("email is required")
	}
	if jobPayload.Subject == "" {
		return fmt.Errorf("subject is required")
	}
	if jobPayload.HTML == "" {
		return fmt.Errorf("html body is required")
	}

	// Get SMTP config for from_email
	smtpConfig, err := config.LoadSMTPConfig()
	if err != nil {
		return fmt.Errorf("failed to load SMTP config: %w", err)
	}

	// Send email via SMTP
	messageID, err := w.smtpSender.Send(jobPayload.Email, jobPayload.Subject, jobPayload.HTML)
	if err != nil {
		w.logger.Error().
			Err(err).
			Str("event", "email.send.failed").
			Str("to", jobPayload.Email).
			Str("subject", jobPayload.Subject).
			Msg("Failed to send email")

		// Try to save failed email record
		w.saveEmailRecord(ctx, messageID, smtpConfig.FromEmail, jobPayload.Email, jobPayload.Subject, "failed")
		// Update metrics
		metrics.GetMetrics().IncrementEmailFailed()
		return fmt.Errorf("failed to send email: %w", err)
	}

	// Save email record with status "sent"
	if err := w.saveEmailRecord(ctx, messageID, smtpConfig.FromEmail, jobPayload.Email, jobPayload.Subject, "sent"); err != nil {
		w.logger.Error().
			Err(err).
			Str("event", "email.save.failed").
			Str("message_id", messageID).
			Msg("Failed to save email record")
		// Don't return error - email was sent successfully
	}

	w.logger.Info().
		Str("event", "email.send.success").
		Str("message_id", messageID).
		Str("to", jobPayload.Email).
		Str("subject", jobPayload.Subject).
		Msg("Email sent and saved successfully")

	// Update metrics
	metrics.GetMetrics().IncrementEmailSent()

	return nil
}

// saveEmailRecord saves email record to database
func (w *EmailWorker) saveEmailRecord(ctx context.Context, messageID, fromEmail, toEmail, subject, status string) error {
	emailRecord := models.EmailMessageRecord{
		ID:        uuid.New(),
		MessageID: messageID,
		From:      fromEmail,
		To:        toEmail,
		Subject:   subject,
		Status:    status,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	return w.emailRepo.CreateEmailMessage(ctx, emailRecord)
}
