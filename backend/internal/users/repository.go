package users

import (
	"context"
	"fmt"

	"backend/internal/db"
	"backend/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Repository defines user repository interface
type Repository interface {
	Create(ctx context.Context, user *models.User) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	GetByClientID(ctx context.Context, clientID uuid.UUID) ([]models.User, error)
	Update(ctx context.Context, user *models.User) error
	UpdateLastLogin(ctx context.Context, id uuid.UUID) error
	Delete(ctx context.Context, id uuid.UUID) error
	List(ctx context.Context, limit, offset int) ([]models.User, int64, error)
}

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new user repository
func NewRepository() Repository {
	return &repository{
		db: db.DB,
	}
}

// Create creates a new user
func (r *repository) Create(ctx context.Context, user *models.User) error {
	if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	return nil
}

// GetByID retrieves a user by ID
func (r *repository) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var user models.User
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return &user, nil
}

// GetByEmail retrieves a user by email
func (r *repository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	if err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return &user, nil
}

// GetByClientID retrieves all users for a client
func (r *repository) GetByClientID(ctx context.Context, clientID uuid.UUID) ([]models.User, error) {
	var users []models.User
	if err := r.db.WithContext(ctx).Where("client_id = ?", clientID).Order("created_at DESC").Find(&users).Error; err != nil {
		return nil, fmt.Errorf("failed to get users: %w", err)
	}
	return users, nil
}

// Update updates a user
func (r *repository) Update(ctx context.Context, user *models.User) error {
	if err := r.db.WithContext(ctx).Save(user).Error; err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	return nil
}

// UpdateLastLogin updates the last login timestamp
func (r *repository) UpdateLastLogin(ctx context.Context, id uuid.UUID) error {
	now := db.DB.NowFunc()
	if err := r.db.WithContext(ctx).Model(&models.User{}).Where("id = ?", id).Update("last_login", now).Error; err != nil {
		return fmt.Errorf("failed to update last login: %w", err)
	}
	return nil
}

// Delete deletes a user
func (r *repository) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).Delete(&models.User{}, id).Error; err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}
	return nil
}

// List retrieves users with pagination
func (r *repository) List(ctx context.Context, limit, offset int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	// Count total
	if err := r.db.WithContext(ctx).Model(&models.User{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count users: %w", err)
	}

	// Get users with pagination
	if err := r.db.WithContext(ctx).Limit(limit).Offset(offset).Order("created_at DESC").Find(&users).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list users: %w", err)
	}

	return users, total, nil
}
