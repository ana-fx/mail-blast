package campaigns

import (
	"context"
	"fmt"

	"backend/internal/db"
	"backend/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Repository defines campaign repository interface
type Repository interface {
	Create(ctx context.Context, campaign *models.Campaign) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Campaign, error)
	GetByClientID(ctx context.Context, clientID uuid.UUID) ([]models.Campaign, error)
	Update(ctx context.Context, campaign *models.Campaign) error
	UpdateStatus(ctx context.Context, id uuid.UUID, status string) error
	GetScheduledCampaigns(ctx context.Context) ([]models.Campaign, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new campaign repository
func NewRepository() Repository {
	return &repository{
		db: db.DB,
	}
}

// Create creates a new campaign
func (r *repository) Create(ctx context.Context, campaign *models.Campaign) error {
	if err := r.db.WithContext(ctx).Create(campaign).Error; err != nil {
		return fmt.Errorf("failed to create campaign: %w", err)
	}
	return nil
}

// GetByID retrieves a campaign by ID
func (r *repository) GetByID(ctx context.Context, id uuid.UUID) (*models.Campaign, error) {
	var campaign models.Campaign
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&campaign).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("campaign not found")
		}
		return nil, fmt.Errorf("failed to get campaign: %w", err)
	}
	return &campaign, nil
}

// GetByClientID retrieves all campaigns for a client
func (r *repository) GetByClientID(ctx context.Context, clientID uuid.UUID) ([]models.Campaign, error) {
	var campaigns []models.Campaign
	if err := r.db.WithContext(ctx).Where("client_id = ?", clientID).Order("created_at DESC").Find(&campaigns).Error; err != nil {
		return nil, fmt.Errorf("failed to get campaigns: %w", err)
	}
	return campaigns, nil
}

// Update updates a campaign
func (r *repository) Update(ctx context.Context, campaign *models.Campaign) error {
	if err := r.db.WithContext(ctx).Save(campaign).Error; err != nil {
		return fmt.Errorf("failed to update campaign: %w", err)
	}
	return nil
}

// UpdateStatus updates only the status of a campaign
func (r *repository) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	if err := r.db.WithContext(ctx).Model(&models.Campaign{}).Where("id = ?", id).Update("status", status).Error; err != nil {
		return fmt.Errorf("failed to update campaign status: %w", err)
	}
	return nil
}

// GetScheduledCampaigns retrieves campaigns that are scheduled and ready to send
func (r *repository) GetScheduledCampaigns(ctx context.Context) ([]models.Campaign, error) {
	var campaigns []models.Campaign
	now := db.DB.NowFunc()
	if err := r.db.WithContext(ctx).
		Where("status = ? AND send_at IS NOT NULL AND send_at <= ?", "scheduled", now).
		Find(&campaigns).Error; err != nil {
		return nil, fmt.Errorf("failed to get scheduled campaigns: %w", err)
	}
	return campaigns, nil
}

// Delete deletes a campaign
func (r *repository) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).Delete(&models.Campaign{}, id).Error; err != nil {
		return fmt.Errorf("failed to delete campaign: %w", err)
	}
	return nil
}
