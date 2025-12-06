package campaigns

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"backend/internal/models"

	"github.com/google/uuid"
	"github.com/rs/zerolog"
)

// Service defines campaign service interface
type Service interface {
	CreateCampaign(ctx context.Context, req *CreateCampaignRequest) (*models.Campaign, error)
	GetCampaign(ctx context.Context, id uuid.UUID) (*models.Campaign, error)
	GetCampaignsByClient(ctx context.Context, clientID uuid.UUID) ([]models.Campaign, error)
	UpdateCampaign(ctx context.Context, id uuid.UUID, req *UpdateCampaignRequest) (*models.Campaign, error)
	DeleteCampaign(ctx context.Context, id uuid.UUID) error
	ScheduleCampaign(ctx context.Context, id uuid.UUID, sendAt time.Time) error
	GetScheduledCampaigns(ctx context.Context) ([]models.Campaign, error)
}

type service struct {
	repo   Repository
	logger zerolog.Logger
}

// NewService creates a new campaign service
func NewService(repo Repository) Service {
	return &service{
		repo:   repo,
		logger: zerolog.New(os.Stdout).With().Timestamp().Logger(),
	}
}

// CreateCampaignRequest represents request to create a campaign
type CreateCampaignRequest struct {
	Title       string     `json:"title"`
	Subject     string     `json:"subject"`
	Content     string     `json:"content"`
	TextContent string     `json:"text_content"`
	FromEmail   string     `json:"from_email"`
	ClientID    uuid.UUID  `json:"client_id"`
	TemplateID  *uuid.UUID `json:"template_id,omitempty"`
	SendAt      *time.Time `json:"send_at,omitempty"`
}

// UpdateCampaignRequest represents request to update a campaign
type UpdateCampaignRequest struct {
	Title       *string    `json:"title,omitempty"`
	Subject     *string    `json:"subject,omitempty"`
	Content     *string    `json:"content,omitempty"`
	TextContent *string    `json:"text_content,omitempty"`
	FromEmail   *string    `json:"from_email,omitempty"`
	Status      *string    `json:"status,omitempty"`
	SendAt      *time.Time `json:"send_at,omitempty"`
}

// CreateCampaign creates a new campaign
func (s *service) CreateCampaign(ctx context.Context, req *CreateCampaignRequest) (*models.Campaign, error) {
	// Validate required fields
	if req.Title == "" {
		return nil, fmt.Errorf("title is required")
	}
	if req.Subject == "" {
		return nil, fmt.Errorf("subject is required")
	}
	if req.Content == "" {
		return nil, fmt.Errorf("content is required")
	}
	if req.FromEmail == "" {
		return nil, fmt.Errorf("from_email is required")
	}

	// Determine status based on send_at
	status := "draft"
	if req.SendAt != nil {
		if req.SendAt.After(time.Now()) {
			status = "scheduled"
		} else {
			status = "draft" // Past dates default to draft
		}
	}

	campaign := &models.Campaign{
		Title:       req.Title,
		Subject:     req.Subject,
		Content:     req.Content,
		TextContent: req.TextContent,
		FromEmail:   req.FromEmail,
		Status:      status,
		SendAt:      req.SendAt,
		ClientID:    req.ClientID,
		TemplateID:  req.TemplateID,
	}

	if err := s.repo.Create(ctx, campaign); err != nil {
		return nil, fmt.Errorf("failed to create campaign: %w", err)
	}

	// Write campaign file
	if err := s.writeCampaignFile(campaign); err != nil {
		s.logger.Warn().
			Err(err).
			Str("campaign_id", campaign.ID.String()).
			Msg("Failed to write campaign file, but campaign was created")
		// Don't fail the request if file write fails
	}

	s.logger.Info().
		Str("campaign_id", campaign.ID.String()).
		Str("title", campaign.Title).
		Str("status", campaign.Status).
		Msg("Campaign created successfully")

	return campaign, nil
}

// GetCampaign retrieves a campaign by ID
func (s *service) GetCampaign(ctx context.Context, id uuid.UUID) (*models.Campaign, error) {
	return s.repo.GetByID(ctx, id)
}

// GetCampaignsByClient retrieves all campaigns for a client
func (s *service) GetCampaignsByClient(ctx context.Context, clientID uuid.UUID) ([]models.Campaign, error) {
	return s.repo.GetByClientID(ctx, clientID)
}

// UpdateCampaign updates a campaign
func (s *service) UpdateCampaign(ctx context.Context, id uuid.UUID, req *UpdateCampaignRequest) (*models.Campaign, error) {
	campaign, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.Title != nil {
		campaign.Title = *req.Title
	}
	if req.Subject != nil {
		campaign.Subject = *req.Subject
	}
	if req.Content != nil {
		campaign.Content = *req.Content
	}
	if req.TextContent != nil {
		campaign.TextContent = *req.TextContent
	}
	if req.FromEmail != nil {
		campaign.FromEmail = *req.FromEmail
	}
	if req.Status != nil {
		campaign.Status = *req.Status
	}
	if req.SendAt != nil {
		campaign.SendAt = req.SendAt
		// Update status if send_at changes
		if req.SendAt.After(time.Now()) {
			campaign.Status = "scheduled"
		}
	}

	if err := s.repo.Update(ctx, campaign); err != nil {
		return nil, fmt.Errorf("failed to update campaign: %w", err)
	}

	// Update campaign file
	if err := s.writeCampaignFile(campaign); err != nil {
		s.logger.Warn().
			Err(err).
			Str("campaign_id", campaign.ID.String()).
			Msg("Failed to update campaign file")
	}

	return campaign, nil
}

// DeleteCampaign deletes a campaign
func (s *service) DeleteCampaign(ctx context.Context, id uuid.UUID) error {
	// Delete campaign file
	campaign, err := s.repo.GetByID(ctx, id)
	if err == nil {
		s.deleteCampaignFile(campaign.ID)
	}

	return s.repo.Delete(ctx, id)
}

// ScheduleCampaign schedules a campaign to be sent at a specific time
func (s *service) ScheduleCampaign(ctx context.Context, id uuid.UUID, sendAt time.Time) error {
	if sendAt.Before(time.Now()) {
		return fmt.Errorf("send_at must be in the future")
	}

	campaign, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	campaign.SendAt = &sendAt
	campaign.Status = "scheduled"

	if err := s.repo.Update(ctx, campaign); err != nil {
		return fmt.Errorf("failed to schedule campaign: %w", err)
	}

	return nil
}

// GetScheduledCampaigns retrieves campaigns ready to be sent
func (s *service) GetScheduledCampaigns(ctx context.Context) ([]models.Campaign, error) {
	return s.repo.GetScheduledCampaigns(ctx)
}

// writeCampaignFile writes campaign data to a JSON file
func (s *service) writeCampaignFile(campaign *models.Campaign) error {
	// Get storage path from environment or use default
	storagePath := os.Getenv("CAMPAIGN_STORAGE_PATH")
	if storagePath == "" {
		storagePath = "storage/campaigns"
	}

	// Create directory if it doesn't exist
	if err := os.MkdirAll(storagePath, 0755); err != nil {
		return fmt.Errorf("failed to create storage directory: %w", err)
	}

	// Create file path
	fileName := fmt.Sprintf("campaign_%s.json", campaign.ID.String())
	filePath := filepath.Join(storagePath, fileName)

	// Prepare campaign data for file
	campaignData := map[string]interface{}{
		"id":              campaign.ID.String(),
		"title":           campaign.Title,
		"subject":         campaign.Subject,
		"content":         campaign.Content,
		"text_content":    campaign.TextContent,
		"from_email":      campaign.FromEmail,
		"status":          campaign.Status,
		"send_at":         nil,
		"client_id":       campaign.ClientID.String(),
		"template_id":     nil,
		"recipient_count": campaign.RecipientCount,
		"created_at":      campaign.CreatedAt.Format(time.RFC3339),
		"updated_at":      campaign.UpdatedAt.Format(time.RFC3339),
	}

	if campaign.SendAt != nil {
		campaignData["send_at"] = campaign.SendAt.Format(time.RFC3339)
	}
	if campaign.TemplateID != nil {
		campaignData["template_id"] = campaign.TemplateID.String()
	}

	// Write JSON file
	data, err := json.MarshalIndent(campaignData, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal campaign data: %w", err)
	}

	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return fmt.Errorf("failed to write campaign file: %w", err)
	}

	s.logger.Debug().
		Str("campaign_id", campaign.ID.String()).
		Str("file_path", filePath).
		Msg("Campaign file written successfully")

	return nil
}

// deleteCampaignFile deletes a campaign file
func (s *service) deleteCampaignFile(campaignID uuid.UUID) {
	storagePath := os.Getenv("CAMPAIGN_STORAGE_PATH")
	if storagePath == "" {
		storagePath = "storage/campaigns"
	}

	fileName := fmt.Sprintf("campaign_%s.json", campaignID.String())
	filePath := filepath.Join(storagePath, fileName)

	if err := os.Remove(filePath); err != nil {
		s.logger.Warn().
			Err(err).
			Str("file_path", filePath).
			Msg("Failed to delete campaign file")
	}
}

