package email

import (
	"context"
	"crypto/tls"
	"fmt"
	"net/smtp"
	"os"
	"time"

	"github.com/rs/zerolog"
)

// SmtpConfig holds SMTP configuration
type SmtpConfig struct {
	Host     string
	Port     int
	Username string
	Password string
}

// NewSmtpConfigFromEnv creates SMTP config from environment variables
func NewSmtpConfigFromEnv() (*SmtpConfig, error) {
	cfg := &SmtpConfig{
		Host:     os.Getenv("SMTP_HOST"),
		Port:     587, // Default port
		Username: os.Getenv("SMTP_USERNAME"),
		Password: os.Getenv("SMTP_PASSWORD"),
	}

	if cfg.Host == "" {
		return nil, fmt.Errorf("SMTP_HOST is required")
	}
	if cfg.Username == "" {
		return nil, fmt.Errorf("SMTP_USERNAME is required")
	}
	if cfg.Password == "" {
		return nil, fmt.Errorf("SMTP_PASSWORD is required")
	}

	// Try to get port from env, default to 587
	if portStr := os.Getenv("SMTP_PORT"); portStr != "" {
		var err error
		if _, err = fmt.Sscanf(portStr, "%d", &cfg.Port); err != nil {
			return nil, fmt.Errorf("invalid SMTP_PORT: %w", err)
		}
	}

	return cfg, nil
}

// SmtpSender implements EmailSender using SMTP
type SmtpSender struct {
	config SmtpConfig
	logger zerolog.Logger
}

// NewSmtpSender creates a new SMTP sender
func NewSmtpSender(config *SmtpConfig) *SmtpSender {
	return &SmtpSender{
		config: *config,
		logger: zerolog.New(os.Stdout).With().Timestamp().Logger(),
	}
}

// SendEmail sends an email using SMTP with STARTTLS
func (s *SmtpSender) SendEmail(ctx context.Context, msg EmailMessage) error {
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

	// Build MIME email using SmtpEmailSender's buildMIMEEmail method
	tempSender := &SmtpEmailSender{
		host:     s.config.Host,
		port:     s.config.Port,
		username: s.config.Username,
		password: s.config.Password,
	}
	emailBody, err := tempSender.buildMIMEEmail(msg)
	if err != nil {
		return fmt.Errorf("failed to build MIME email: %w", err)
	}

	// Create SMTP connection with timeout
	addr := fmt.Sprintf("%s:%d", s.config.Host, s.config.Port)

	// Use context with timeout
	ctxWithTimeout, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// Connect to SMTP server
	conn, err := smtp.Dial(addr)
	if err != nil {
		return fmt.Errorf("failed to connect to SMTP server: %w", err)
	}
	defer conn.Close()

	// Check if context is cancelled
	select {
	case <-ctxWithTimeout.Done():
		return ctxWithTimeout.Err()
	default:
	}

	// STARTTLS
	tlsConfig := &tls.Config{
		ServerName:         s.config.Host,
		InsecureSkipVerify: false,
	}
	if err := conn.StartTLS(tlsConfig); err != nil {
		return fmt.Errorf("failed to start TLS: %w", err)
	}

	// Authenticate
	auth := smtp.PlainAuth("", s.config.Username, s.config.Password, s.config.Host)
	if err := conn.Auth(auth); err != nil {
		return fmt.Errorf("failed to authenticate: %w", err)
	}

	// Set sender
	if err := conn.Mail(msg.From); err != nil {
		return fmt.Errorf("failed to set sender: %w", err)
	}

	// Set recipient
	if err := conn.Rcpt(msg.To); err != nil {
		return fmt.Errorf("failed to set recipient: %w", err)
	}

	// Send email data
	writer, err := conn.Data()
	if err != nil {
		return fmt.Errorf("failed to get data writer: %w", err)
	}

	// Check context before writing
	select {
	case <-ctxWithTimeout.Done():
		writer.Close()
		return ctxWithTimeout.Err()
	default:
	}

	_, err = writer.Write(emailBody)
	if err != nil {
		writer.Close()
		return fmt.Errorf("failed to write email data: %w", err)
	}

	if err := writer.Close(); err != nil {
		return fmt.Errorf("failed to close data writer: %w", err)
	}

	s.logger.Info().
		Str("event", "email.sent").
		Str("to", msg.To).
		Str("subject", msg.Subject).
		Msg("Email sent successfully via SMTP")

	return nil
}

