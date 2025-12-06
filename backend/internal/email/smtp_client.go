package email

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/smtp"
	"os"
	"strings"
	"time"

	"backend/internal/config"
	"backend/internal/models"
	"backend/internal/repositories"

	"github.com/google/uuid"
	"github.com/rs/zerolog"
)

// EmailMessage represents an email message
type EmailMessage struct {
	From     string
	To       string
	Subject  string
	HTMLBody string
	TextBody string
	Headers  map[string]string
}

// EmailSender defines the interface for sending emails
type EmailSender interface {
	SendEmail(ctx context.Context, msg EmailMessage) error
}

// SmtpEmailSender implements EmailSender using SMTP
type SmtpEmailSender struct {
	host     string
	port     int
	username string
	password string
	repo     repositories.EmailRepository
	logger   zerolog.Logger
}

// NewSmtpEmailSender creates a new SMTP email sender using config
func NewSmtpEmailSender() (*SmtpEmailSender, error) {
	cfg := config.AppConfig
	if cfg == nil {
		return nil, fmt.Errorf("config not initialized")
	}

	if cfg.AWSSESSMTPEndpoint == "" {
		return nil, fmt.Errorf("AWS_SES_SMTP_ENDPOINT not configured")
	}

	if cfg.AWSAccessKeyID == "" || cfg.AWSSecretKey == "" {
		return nil, fmt.Errorf("AWS credentials not configured")
	}

	logger := zerolog.New(os.Stdout).With().Timestamp().Logger()

	return &SmtpEmailSender{
		host:     cfg.AWSSESSMTPEndpoint,
		port:     cfg.AWSSESSMTPPort,
		username: cfg.AWSAccessKeyID,
		password: cfg.AWSSecretKey,
		repo:     repositories.NewEmailRepository(),
		logger:   logger,
	}, nil
}

// SendEmail sends an email using SMTP with STARTTLS
func (s *SmtpEmailSender) SendEmail(ctx context.Context, msg EmailMessage) error {
	// Generate Message-ID
	messageID := s.generateMessageID(msg.From)

	// Log email queued
	s.logger.Info().
		Str("event", "email.queued").
		Str("message_id", messageID).
		Str("to", msg.To).
		Str("subject", msg.Subject).
		Msg("Email queued")

	// Create email message record (status = "queued")
	emailRecord := models.EmailMessageRecord{
		MessageID: messageID,
		From:      msg.From,
		To:        msg.To,
		Subject:   msg.Subject,
		Status:    "queued",
	}

	if err := s.repo.CreateEmailMessage(ctx, emailRecord); err != nil {
		s.logger.Error().
			Err(err).
			Str("event", "email.queued.failed").
			Str("message_id", messageID).
			Msg("Failed to create email record")
		return fmt.Errorf("failed to create email record: %w", err)
	}

	// Validate required fields
	if msg.From == "" {
		return fmt.Errorf("from address is required")
	}
	if msg.To == "" {
		return fmt.Errorf("to address is required")
	}
	if msg.Subject == "" {
		return fmt.Errorf("subject is required")
	}
	if msg.HTMLBody == "" && msg.TextBody == "" {
		return fmt.Errorf("either HTMLBody or TextBody is required")
	}

	// Add Message-ID to headers if not present
	if msg.Headers == nil {
		msg.Headers = make(map[string]string)
	}
	if _, exists := msg.Headers["Message-ID"]; !exists {
		msg.Headers["Message-ID"] = messageID
	}

	// Inject tracking pixel and rewrite links for HTML emails
	if msg.HTMLBody != "" {
		// Get tracking domain from config
		trackingDomain := config.AppConfig.TrackingDomain
		if trackingDomain == "" {
			trackingDomain = "http://localhost:8080"
		}

		// Rewrite links for click tracking
		msg.HTMLBody = RewriteLinks(msg.HTMLBody, messageID, trackingDomain)

		// Add tracking pixel
		cleanMessageID := strings.Trim(messageID, "<>")
		trackingPixel := fmt.Sprintf(
			`<img src="%s/track/open/%s.png" width="1" height="1" style="display:none;" />`,
			strings.TrimSuffix(trackingDomain, "/"),
			cleanMessageID,
		)
		msg.HTMLBody = msg.HTMLBody + trackingPixel
	}

	// Log SMTP send start
	s.logger.Info().
		Str("event", "email.smtp.start").
		Str("message_id", messageID).
		Str("to", msg.To).
		Msg("SMTP send started")

	// Build MIME email
	emailBody, err := s.buildMIMEEmail(msg)
	if err != nil {
		s.logger.Error().
			Err(err).
			Str("event", "email.build.failed").
			Str("message_id", messageID).
			Msg("Failed to build MIME email")

		// Update status to failed
		s.repo.UpdateEmailStatus(ctx, emailRecord.ID, "failed")
		metaJSON, _ := json.Marshal(map[string]string{"error": err.Error()})
		s.repo.AddEmailEvent(ctx, models.EmailEventRecord{
			EmailID:   emailRecord.ID,
			EventType: "failed",
			Meta:      metaJSON,
		})

		return fmt.Errorf("failed to build MIME email: %w", err)
	}

	// Create SMTP connection with timeout
	addr := fmt.Sprintf("%s:%d", s.host, s.port)

	// Use context with timeout
	ctxWithTimeout, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// Connect to SMTP server
	conn, err := smtp.Dial(addr)
	if err != nil {
		s.logger.Error().
			Err(err).
			Str("event", "email.smtp.connect.failed").
			Str("message_id", messageID).
			Msg("Failed to connect to SMTP server")

		// Update status to failed
		s.repo.UpdateEmailStatus(ctx, emailRecord.ID, "failed")
		metaJSON, _ := json.Marshal(map[string]string{"error": err.Error()})
		s.repo.AddEmailEvent(ctx, models.EmailEventRecord{
			EmailID:   emailRecord.ID,
			EventType: "failed",
			Meta:      metaJSON,
		})

		return fmt.Errorf("failed to connect to SMTP server: %w", err)
	}
	defer conn.Close()

	// Check if context is cancelled
	select {
	case <-ctxWithTimeout.Done():
		s.logger.Warn().
			Str("event", "email.cancelled").
			Str("message_id", messageID).
			Msg("Context cancelled before sending email")
		return ctxWithTimeout.Err()
	default:
	}

	// STARTTLS
	tlsConfig := &tls.Config{
		ServerName:         s.host,
		InsecureSkipVerify: false,
	}
	if err := conn.StartTLS(tlsConfig); err != nil {
		s.logger.Error().
			Err(err).
			Str("event", "email.smtp.tls.failed").
			Str("message_id", messageID).
			Msg("Failed to start TLS")

		// Update status to failed
		s.repo.UpdateEmailStatus(ctx, emailRecord.ID, "failed")
		metaJSON, _ := json.Marshal(map[string]string{"error": err.Error()})
		s.repo.AddEmailEvent(ctx, models.EmailEventRecord{
			EmailID:   emailRecord.ID,
			EventType: "failed",
			Meta:      metaJSON,
		})

		return fmt.Errorf("failed to start TLS: %w", err)
	}

	// Authenticate
	auth := smtp.PlainAuth("", s.username, s.password, s.host)
	if err := conn.Auth(auth); err != nil {
		s.logger.Error().
			Err(err).
			Str("event", "email.smtp.auth.failed").
			Str("message_id", messageID).
			Msg("Failed to authenticate")

		// Update status to failed
		s.repo.UpdateEmailStatus(ctx, emailRecord.ID, "failed")
		metaJSON, _ := json.Marshal(map[string]string{"error": err.Error()})
		s.repo.AddEmailEvent(ctx, models.EmailEventRecord{
			EmailID:   emailRecord.ID,
			EventType: "failed",
			Meta:      metaJSON,
		})

		return fmt.Errorf("failed to authenticate: %w", err)
	}

	// Set sender
	if err := conn.Mail(msg.From); err != nil {
		s.logger.Error().
			Err(err).
			Str("event", "email.smtp.sender.failed").
			Str("message_id", messageID).
			Msg("Failed to set sender")

		// Update status to failed
		s.repo.UpdateEmailStatus(ctx, emailRecord.ID, "failed")
		metaJSON, _ := json.Marshal(map[string]string{"error": err.Error()})
		s.repo.AddEmailEvent(ctx, models.EmailEventRecord{
			EmailID:   emailRecord.ID,
			EventType: "failed",
			Meta:      metaJSON,
		})

		return fmt.Errorf("failed to set sender: %w", err)
	}

	// Set recipient
	if err := conn.Rcpt(msg.To); err != nil {
		s.logger.Error().
			Err(err).
			Str("event", "email.smtp.recipient.failed").
			Str("message_id", messageID).
			Msg("Failed to set recipient")

		// Update status to failed
		s.repo.UpdateEmailStatus(ctx, emailRecord.ID, "failed")
		metaJSON, _ := json.Marshal(map[string]string{"error": err.Error()})
		s.repo.AddEmailEvent(ctx, models.EmailEventRecord{
			EmailID:   emailRecord.ID,
			EventType: "failed",
			Meta:      metaJSON,
		})

		return fmt.Errorf("failed to set recipient: %w", err)
	}

	// Send email data
	writer, err := conn.Data()
	if err != nil {
		s.logger.Error().
			Err(err).
			Str("event", "email.smtp.data.failed").
			Str("message_id", messageID).
			Msg("Failed to get data writer")

		// Update status to failed
		s.repo.UpdateEmailStatus(ctx, emailRecord.ID, "failed")
		metaJSON, _ := json.Marshal(map[string]string{"error": err.Error()})
		s.repo.AddEmailEvent(ctx, models.EmailEventRecord{
			EmailID:   emailRecord.ID,
			EventType: "failed",
			Meta:      metaJSON,
		})

		return fmt.Errorf("failed to get data writer: %w", err)
	}

	// Check context before writing
	select {
	case <-ctxWithTimeout.Done():
		writer.Close()
		s.logger.Warn().
			Str("event", "email.cancelled").
			Str("message_id", messageID).
			Msg("Context cancelled before writing email data")

		// Update status to failed
		s.repo.UpdateEmailStatus(ctx, emailRecord.ID, "failed")
		s.repo.AddEmailEvent(ctx, models.EmailEventRecord{
			EmailID:   emailRecord.ID,
			EventType: "failed",
			Meta:      json.RawMessage(`{"error": "context cancelled"}`),
		})

		return ctxWithTimeout.Err()
	default:
	}

	_, err = writer.Write(emailBody)
	if err != nil {
		writer.Close()
		s.logger.Error().
			Err(err).
			Str("event", "email.smtp.write.failed").
			Str("message_id", messageID).
			Msg("Failed to write email data")

		// Update status to failed
		s.repo.UpdateEmailStatus(ctx, emailRecord.ID, "failed")
		metaJSON, _ := json.Marshal(map[string]string{"error": err.Error()})
		s.repo.AddEmailEvent(ctx, models.EmailEventRecord{
			EmailID:   emailRecord.ID,
			EventType: "failed",
			Meta:      metaJSON,
		})

		return fmt.Errorf("failed to write email data: %w", err)
	}

	if err := writer.Close(); err != nil {
		s.logger.Error().
			Err(err).
			Str("event", "email.smtp.close.failed").
			Str("message_id", messageID).
			Msg("Failed to close data writer")

		// Update status to failed
		s.repo.UpdateEmailStatus(ctx, emailRecord.ID, "failed")
		metaJSON, _ := json.Marshal(map[string]string{"error": err.Error()})
		s.repo.AddEmailEvent(ctx, models.EmailEventRecord{
			EmailID:   emailRecord.ID,
			EventType: "failed",
			Meta:      metaJSON,
		})

		return fmt.Errorf("failed to close data writer: %w", err)
	}

	// Update status to sent
	if err := s.repo.UpdateEmailStatus(ctx, emailRecord.ID, "sent"); err != nil {
		s.logger.Warn().
			Err(err).
			Str("event", "email.status.update.failed").
			Str("message_id", messageID).
			Msg("Failed to update email status to sent")
	}

	// Create sent event
	metaJSON, _ := json.Marshal(map[string]string{
		"to":      msg.To,
		"subject": msg.Subject,
	})
	s.repo.AddEmailEvent(ctx, models.EmailEventRecord{
		EmailID:   emailRecord.ID,
		EventType: "sent",
		Meta:      metaJSON,
	})

	// Log success
	s.logger.Info().
		Str("event", "email.sent").
		Str("message_id", messageID).
		Str("to", msg.To).
		Str("subject", msg.Subject).
		Msg("Email sent successfully")

	return nil
}

// buildMIMEEmail builds a complete MIME email message
func (s *SmtpEmailSender) buildMIMEEmail(msg EmailMessage) ([]byte, error) {
	var buf bytes.Buffer

	// Generate boundary for multipart message
	boundary := fmt.Sprintf("----=_Part_%d_%d", time.Now().Unix(), time.Now().UnixNano())

	// Build headers
	headers := make(map[string]string)

	// Set default headers
	headers["From"] = msg.From
	headers["To"] = msg.To
	headers["Subject"] = s.encodeSubject(msg.Subject)
	headers["MIME-Version"] = "1.0"

	// Add Message-ID if provided in headers
	if msgID, ok := msg.Headers["Message-ID"]; ok {
		headers["Message-ID"] = msgID
	} else {
		// Generate Message-ID if not provided
		headers["Message-ID"] = s.generateMessageID(msg.From)
	}

	// Add custom headers
	for key, value := range msg.Headers {
		if key != "Message-ID" { // Already handled above
			headers[key] = value
		}
	}

	// Write headers
	for key, value := range headers {
		buf.WriteString(fmt.Sprintf("%s: %s\r\n", key, value))
	}

	// Determine if we need multipart
	hasHTML := msg.HTMLBody != ""
	hasText := msg.TextBody != ""

	if hasHTML && hasText {
		// Multipart/alternative
		buf.WriteString(fmt.Sprintf("Content-Type: multipart/alternative; boundary=\"%s\"\r\n", boundary))
		buf.WriteString("\r\n")

		// Text part
		buf.WriteString(fmt.Sprintf("--%s\r\n", boundary))
		buf.WriteString("Content-Type: text/plain; charset=UTF-8\r\n")
		buf.WriteString("Content-Transfer-Encoding: quoted-printable\r\n")
		buf.WriteString("\r\n")
		buf.WriteString(s.quotedPrintableEncode(msg.TextBody))
		buf.WriteString("\r\n")

		// HTML part
		buf.WriteString(fmt.Sprintf("--%s\r\n", boundary))
		buf.WriteString("Content-Type: text/html; charset=UTF-8\r\n")
		buf.WriteString("Content-Transfer-Encoding: quoted-printable\r\n")
		buf.WriteString("\r\n")
		buf.WriteString(s.quotedPrintableEncode(msg.HTMLBody))
		buf.WriteString("\r\n")

		// Close boundary
		buf.WriteString(fmt.Sprintf("--%s--\r\n", boundary))
	} else if hasHTML {
		// HTML only
		buf.WriteString("Content-Type: text/html; charset=UTF-8\r\n")
		buf.WriteString("Content-Transfer-Encoding: quoted-printable\r\n")
		buf.WriteString("\r\n")
		buf.WriteString(s.quotedPrintableEncode(msg.HTMLBody))
	} else if hasText {
		// Text only
		buf.WriteString("Content-Type: text/plain; charset=UTF-8\r\n")
		buf.WriteString("Content-Transfer-Encoding: quoted-printable\r\n")
		buf.WriteString("\r\n")
		buf.WriteString(s.quotedPrintableEncode(msg.TextBody))
	}

	return buf.Bytes(), nil
}

// encodeSubject encodes email subject for MIME
func (s *SmtpEmailSender) encodeSubject(subject string) string {
	// Simple encoding - if subject contains non-ASCII, encode it
	if s.isASCII(subject) {
		return subject
	}
	// For simplicity, return as-is (in production, use proper MIME encoding)
	return subject
}

// isASCII checks if string contains only ASCII characters
func (s *SmtpEmailSender) isASCII(str string) bool {
	for i := 0; i < len(str); i++ {
		if str[i] > 127 {
			return false
		}
	}
	return true
}

// quotedPrintableEncode performs basic quoted-printable encoding
func (s *SmtpEmailSender) quotedPrintableEncode(text string) string {
	var buf bytes.Buffer
	lineLen := 0
	maxLineLen := 76

	for _, char := range text {
		// Check if we need to break line
		if lineLen >= maxLineLen {
			buf.WriteString("=\r\n")
			lineLen = 0
		}

		// Encode if necessary
		if char == '\r' || char == '\n' {
			if char == '\n' {
				buf.WriteByte('\n')
				lineLen = 0
			}
			continue
		} else if char == '=' || char > 127 || char < 32 {
			// Encode as =XX
			buf.WriteString(fmt.Sprintf("=%02X", char))
			lineLen += 3
		} else {
			buf.WriteRune(char)
			lineLen++
		}
	}

	return buf.String()
}

// generateMessageID generates a unique Message-ID in format <UUID@domain>
func (s *SmtpEmailSender) generateMessageID(from string) string {
	domain := "mailer.local"
	if idx := strings.LastIndex(from, "@"); idx != -1 {
		domain = from[idx+1:]
	}
	msgUUID := uuid.New()
	return fmt.Sprintf("<%s@%s>", msgUUID.String(), domain)
}
