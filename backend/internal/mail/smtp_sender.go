package mail

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"net/smtp"
	"os"
	"strings"
	"time"

	"backend/internal/config"

	"github.com/google/uuid"
	"github.com/rs/zerolog"
)

// SMTPSender interface for sending emails via SMTP
type SMTPSender interface {
	Send(to string, subject string, body string) (string, error)
}

// smtpSender implements SMTPSender using net/smtp
type smtpSender struct {
	config config.SMTPConfig
	logger zerolog.Logger
}

// NewSMTPSender creates a new SMTP sender
func NewSMTPSender(cfg config.SMTPConfig) SMTPSender {
	return &smtpSender{
		config: cfg,
		logger: zerolog.New(os.Stdout).With().Timestamp().Logger(),
	}
}

// Send sends an email via SMTP and returns the Message-ID
func (s *smtpSender) Send(to string, subject string, body string) (string, error) {
	// Generate Message-ID
	messageID := s.generateMessageID()

	// Build email headers
	headers := s.buildHeaders(to, subject, messageID)

	// Build email body
	emailBody := s.buildEmailBody(headers, body)

	// Send via SMTP
	addr := fmt.Sprintf("%s:%d", s.config.Host, s.config.Port)

	// Create SMTP connection
	conn, err := smtp.Dial(addr)
	if err != nil {
		return messageID, fmt.Errorf("failed to connect to SMTP server: %w", err)
	}
	defer conn.Close()

	// Use TLS if encryption is "tls"
	if s.config.Encryption == "tls" {
		tlsConfig := &tls.Config{
			ServerName:         s.config.Host,
			InsecureSkipVerify: false,
		}
		if err := conn.StartTLS(tlsConfig); err != nil {
			return messageID, fmt.Errorf("failed to start TLS: %w", err)
		}
	}

	// Authenticate
	auth := smtp.PlainAuth("", s.config.Username, s.config.Password, s.config.Host)
	if err := conn.Auth(auth); err != nil {
		return messageID, fmt.Errorf("failed to authenticate: %w", err)
	}

	// Set sender (SMTP MAIL command uses email address only)
	if err := conn.Mail(s.config.FromEmail); err != nil {
		return messageID, fmt.Errorf("failed to set sender: %w", err)
	}

	// Set recipient
	if err := conn.Rcpt(to); err != nil {
		return messageID, fmt.Errorf("failed to set recipient: %w", err)
	}

	// Send email data
	writer, err := conn.Data()
	if err != nil {
		return messageID, fmt.Errorf("failed to get data writer: %w", err)
	}

	_, err = writer.Write(emailBody)
	if err != nil {
		writer.Close()
		return messageID, fmt.Errorf("failed to write email data: %w", err)
	}

	if err := writer.Close(); err != nil {
		return messageID, fmt.Errorf("failed to close data writer: %w", err)
	}

	s.logger.Info().
		Str("event", "email.smtp.sent").
		Str("message_id", messageID).
		Str("to", to).
		Str("subject", subject).
		Msg("Email sent successfully via SMTP")

	return messageID, nil
}

// buildHeaders builds email headers
func (s *smtpSender) buildHeaders(to, subject, messageID string) map[string]string {
	headers := make(map[string]string)

	// From header
	from := s.config.FromEmail
	if s.config.FromName != "" {
		from = fmt.Sprintf("%s <%s>", s.config.FromName, s.config.FromEmail)
	}
	headers["From"] = from

	// To header
	headers["To"] = to

	// Subject header
	headers["Subject"] = subject

	// Message-ID header
	headers["Message-ID"] = messageID

	// MIME-Version
	headers["MIME-Version"] = "1.0"

	// Content-Type
	headers["Content-Type"] = `text/html; charset="UTF-8"`

	// Date
	headers["Date"] = time.Now().Format(time.RFC1123Z)

	return headers
}

// buildEmailBody builds the complete email body with headers
func (s *smtpSender) buildEmailBody(headers map[string]string, body string) []byte {
	var buf bytes.Buffer

	// Write headers
	for key, value := range headers {
		buf.WriteString(fmt.Sprintf("%s: %s\r\n", key, value))
	}

	// Empty line between headers and body
	buf.WriteString("\r\n")

	// Write body
	buf.WriteString(body)

	return buf.Bytes()
}

// generateMessageID generates a unique RFC-compliant Message-ID
func (s *smtpSender) generateMessageID() string {
	// Extract domain from FromEmail
	domain := "mailblast.local"
	if idx := strings.LastIndex(s.config.FromEmail, "@"); idx != -1 {
		domain = s.config.FromEmail[idx+1:]
	}

	// Generate UUID for unique part
	uniqueID := uuid.New().String()

	// Format: <UUID@domain>
	return fmt.Sprintf("<%s@%s>", uniqueID, domain)
}

