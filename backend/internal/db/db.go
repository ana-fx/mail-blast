package db

import (
	"embed"
	"fmt"
	"log"
	"strings"

	"backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

var DB *gorm.DB

// InitDB initializes the database connection and runs migrations
func InitDB(databaseURL string) error {
	var err error

	// Open database connection
	DB, err = gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		return err
	}

	// Enable UUID extension
	if err = DB.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"").Error; err != nil {
		log.Printf("Warning: Failed to create uuid extension (may already exist): %v", err)
	}

	// Auto-migrate models
	if err = DB.AutoMigrate(&models.User{}, &models.Client{}, &models.Contact{}, &models.EmailMessageRecord{}, &models.EmailEventRecord{}, &models.Campaign{}); err != nil {
		return err
	}

	// Run SQL migrations for indexes and additional constraints
	if err = runSQLMigrations(); err != nil {
		log.Printf("Warning: Failed to run SQL migrations (may already exist): %v", err)
		// Don't fail if migrations already exist
	}

	log.Println("Database connection established and migrations completed")
	return nil
}

// runSQLMigrations executes SQL migration files
func runSQLMigrations() error {
	// Read and execute complete schema migration
	migrationSQL, err := migrationsFS.ReadFile("migrations/001_complete_schema.sql")
	if err != nil {
		// If migration file doesn't exist, that's okay - GORM AutoMigrate will handle it
		log.Printf("Info: SQL migration file not found, using GORM AutoMigrate only: %v", err)
		return nil
	}

	// Execute migration SQL
	if err := DB.Exec(string(migrationSQL)).Error; err != nil {
		// Check if error is because tables/indexes already exist
		if !isAlreadyExistsError(err) {
			return fmt.Errorf("failed to execute migration: %w", err)
		}
		// If already exists, that's fine - continue
		log.Printf("Info: Migration already applied, skipping")
	}

	return nil
}

// isAlreadyExistsError checks if error is due to object already existing
func isAlreadyExistsError(err error) bool {
	if err == nil {
		return false
	}
	errStr := strings.ToLower(err.Error())
	// PostgreSQL error messages for already existing objects
	return strings.Contains(errStr, "already exists") ||
		strings.Contains(errStr, "duplicate key") ||
		strings.Contains(errStr, "relation already exists")
}
