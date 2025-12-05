package db

import (
	"log"

	"backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

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
	if err = DB.AutoMigrate(&models.Client{}, &models.Contact{}); err != nil {
		return err
	}

	log.Println("Database connection established and migrations completed")
	return nil
}
