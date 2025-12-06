package config

import (
	"fmt"
	"strconv"

	"github.com/joho/godotenv"
)

// SMTPConfig holds SMTP configuration
type SMTPConfig struct {
	Host       string
	Port       int
	Username   string
	Password   string
	Encryption string
	FromEmail  string
	FromName   string
}

// LoadSMTPConfig loads SMTP configuration from environment variables
func LoadSMTPConfig() (SMTPConfig, error) {
	// Try to load .env file (ignore error if it doesn't exist)
	_ = godotenv.Load()

	cfg := SMTPConfig{
		Host:       getEnv("MAIL_HOST", ""),
		Port:       587, // Default port
		Username:   getEnv("MAIL_USERNAME", ""),
		Password:   getEnv("MAIL_PASSWORD", ""),
		Encryption: getEnv("MAIL_ENCRYPTION", "tls"),
		FromEmail:  getEnv("MAIL_FROM_ADDRESS", ""),
		FromName:   getEnv("MAIL_FROM_NAME", "MailBlast"),
	}

	// Parse port from env
	if portStr := getEnv("MAIL_PORT", ""); portStr != "" {
		port, err := strconv.Atoi(portStr)
		if err != nil {
			return cfg, fmt.Errorf("invalid MAIL_PORT: %w", err)
		}
		cfg.Port = port
	}

	// Fail fast if essential fields are empty
	if cfg.Host == "" {
		return cfg, fmt.Errorf("MAIL_HOST is required")
	}
	if cfg.Username == "" {
		return cfg, fmt.Errorf("MAIL_USERNAME is required")
	}
	if cfg.Password == "" {
		return cfg, fmt.Errorf("MAIL_PASSWORD is required")
	}
	if cfg.FromEmail == "" {
		return cfg, fmt.Errorf("MAIL_FROM_ADDRESS is required")
	}

	return cfg, nil
}

