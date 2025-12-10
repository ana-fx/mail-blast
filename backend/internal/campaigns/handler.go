package campaigns

import (
	"os"
	"time"

	"backend/internal/auth"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/rs/zerolog"
)

// Handler handles campaign HTTP requests
type Handler struct {
	service Service
	logger  zerolog.Logger
}

// NewHandler creates a new campaign handler
func NewHandler(service Service) *Handler {
	return &Handler{
		service: service,
		logger:  zerolog.New(os.Stdout).With().Timestamp().Logger(),
	}
}

// HTTPCreateCampaignRequest represents the HTTP request body for creating a campaign
type HTTPCreateCampaignRequest struct {
	Title       string     `json:"title"`
	Subject     string     `json:"subject"`
	Content     string     `json:"content"`
	TextContent string     `json:"text_content"`
	FromEmail   string     `json:"from_email"`
	ClientID    string     `json:"client_id"`
	TemplateID  *string    `json:"template_id,omitempty"`
	SendAt      *time.Time `json:"send_at,omitempty"`
}

// HTTPUpdateCampaignRequest represents the HTTP request body for updating a campaign
type HTTPUpdateCampaignRequest struct {
	Title       *string    `json:"title,omitempty"`
	Subject     *string    `json:"subject,omitempty"`
	Content     *string    `json:"content,omitempty"`
	TextContent *string    `json:"text_content,omitempty"`
	FromEmail   *string    `json:"from_email,omitempty"`
	Status      *string    `json:"status,omitempty"`
	SendAt      *time.Time `json:"send_at,omitempty"`
}

// Create handles POST /campaigns
func (h *Handler) Create(c *fiber.Ctx) error {
	var req HTTPCreateCampaignRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Get client_id from request or JWT claims
	var clientID uuid.UUID
	var err error

	// Try to get from request body first
	if req.ClientID != "" {
		clientID, err = uuid.Parse(req.ClientID)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid client_id format",
			})
		}
	} else {
		// Try to get from JWT claims
		if claims, ok := c.Locals("claims").(*auth.Claims); ok && claims != nil && claims.ClientID != nil {
			clientID = *claims.ClientID
		} else if user, ok := c.Locals("user").(*models.User); ok && user != nil && user.ClientID != nil {
			// Fallback to user from context
			clientID = *user.ClientID
		} else {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "client_id is required",
			})
		}
	}

	// Parse template_id if provided
	var templateID *uuid.UUID
	if req.TemplateID != nil && *req.TemplateID != "" {
		parsed, err := uuid.Parse(*req.TemplateID)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid template_id format",
			})
		}
		templateID = &parsed
	}

	// Create service request
	serviceReq := &CreateCampaignRequest{
		Title:       req.Title,
		Subject:     req.Subject,
		Content:     req.Content,
		TextContent: req.TextContent,
		FromEmail:   req.FromEmail,
		ClientID:    clientID,
		TemplateID:  templateID,
		SendAt:      req.SendAt,
	}

	campaign, err := h.service.CreateCampaign(c.Context(), serviceReq)
	if err != nil {
		h.logger.Error().
			Err(err).
			Str("event", "campaign.create.failed").
			Msg("Failed to create campaign")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(campaign)
}

// List handles GET /campaigns
func (h *Handler) List(c *fiber.Ctx) error {
	// For now, return empty array or get all campaigns
	// You can add filtering/pagination later
	campaigns, err := h.service.GetAllCampaigns(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to get campaigns",
		})
	}

	return c.JSON(campaigns)
}

// GetByID handles GET /campaigns/:id
func (h *Handler) GetByID(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid campaign id",
		})
	}

	campaign, err := h.service.GetCampaign(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "campaign not found",
		})
	}

	return c.JSON(campaign)
}

// GetByClient handles GET /campaigns/client/:clientId
func (h *Handler) GetByClient(c *fiber.Ctx) error {
	clientIDStr := c.Params("clientId")
	clientID, err := uuid.Parse(clientIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid client_id",
		})
	}

	campaigns, err := h.service.GetCampaignsByClient(c.Context(), clientID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to get campaigns",
		})
	}

	return c.JSON(campaigns)
}

// Update handles PUT /campaigns/:id
func (h *Handler) Update(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid campaign id",
		})
	}

	var req HTTPUpdateCampaignRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Convert HTTP request to service request
	serviceReq := &UpdateCampaignRequest{
		Title:       req.Title,
		Subject:     req.Subject,
		Content:     req.Content,
		TextContent: req.TextContent,
		FromEmail:   req.FromEmail,
		Status:      req.Status,
		SendAt:      req.SendAt,
	}

	campaign, err := h.service.UpdateCampaign(c.Context(), id, serviceReq)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(campaign)
}

// Delete handles DELETE /campaigns/:id
func (h *Handler) Delete(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid campaign id",
		})
	}

	if err := h.service.DeleteCampaign(c.Context(), id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusNoContent).Send(nil)
}

// Schedule handles POST /campaigns/:id/schedule
func (h *Handler) Schedule(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid campaign id",
		})
	}

	var req struct {
		SendAt time.Time `json:"send_at"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := h.service.ScheduleCampaign(c.Context(), id, req.SendAt); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Campaign scheduled successfully",
	})
}

