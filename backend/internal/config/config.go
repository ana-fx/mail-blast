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
}

var AppConfig *Config

// Load loads configuration from environment variables
func Load() (*Config, error) {
	// Try to load .env file (ignore error if it doesn't exist)
	_ = godotenv.Load()

	appPort, _ := strconv.Atoi(getEnv("APP_PORT", "8080"))

	config := &Config{
		AppPort:        appPort,
		DatabaseURL:    getEnv("DATABASE_URL", ""),
		RedisAddr:      getEnv("REDIS_ADDR", ""),
		AWSRegion:      getEnv("AWS_REGION", ""),
		AWSAccessKeyID: getEnv("AWS_ACCESS_KEY_ID", ""),
		AWSSecretKey:   getEnv("AWS_SECRET_ACCESS_KEY", ""),
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
