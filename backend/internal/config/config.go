package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort        int
	DatabaseURL    string
	RedisAddr      string
	AWSRegion      string
	AWSAccessKeyID string
	AWSSecretKey   string
	// AWS SES SMTP Configuration
	AWSSESSMTPEndpoint string
	AWSSESSMTPPort     int
	SESSenderEmail     string
	// Tracking Configuration
	TrackingDomain string
	// SNS Configuration
	SNSVerify bool
	// SMTP Configuration (for email sending API)
	SMTPHost     string
	SMTPPort     int
	SMTPUsername string
	SMTPPassword string
}

var AppConfig *Config

// Load loads configuration from environment variables
func Load() (*Config, error) {
	// Try to load .env file (ignore error if it doesn't exist)
	_ = godotenv.Load()

	appPort, _ := strconv.Atoi(getEnv("APP_PORT", "8080"))

	sesSMTPPort, _ := strconv.Atoi(getEnv("AWS_SES_SMTP_PORT", "587"))
	snsVerify := getEnv("SNS_VERIFY", "false") == "true"
	smtpPort, _ := strconv.Atoi(getEnv("SMTP_PORT", "587"))

	config := &Config{
		AppPort:        appPort,
		DatabaseURL:    getEnv("DATABASE_URL", ""),
		RedisAddr:      getEnv("REDIS_ADDR", ""),
		AWSRegion:      getEnv("AWS_REGION", ""),
		AWSAccessKeyID: getEnv("AWS_ACCESS_KEY_ID", ""),
		AWSSecretKey:   getEnv("AWS_SECRET_ACCESS_KEY", ""),
		// AWS SES SMTP
		AWSSESSMTPEndpoint: getEnv("AWS_SES_SMTP_ENDPOINT", ""),
		AWSSESSMTPPort:     sesSMTPPort,
		SESSenderEmail:     getEnv("SES_SENDER_EMAIL", ""),
		// Tracking
		TrackingDomain: getEnv("TRACKING_DOMAIN", "http://localhost:8080"),
		// SNS
		SNSVerify: snsVerify,
		// SMTP (for email sending API)
		SMTPHost:     getEnv("SMTP_HOST", ""),
		SMTPPort:     smtpPort,
		SMTPUsername: getEnv("SMTP_USERNAME", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),
	}

	AppConfig = config
	return config, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
