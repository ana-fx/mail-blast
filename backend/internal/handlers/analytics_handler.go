package handlers

import (
	"fmt"
	"os"
	"strconv"

	"backend/internal/services"

	"github.com/gofiber/fiber/v2"
	"github.com/rs/zerolog"
)

// AnalyticsHandler handles analytics API requests
type AnalyticsHandler struct {
	analyticsService *services.AnalyticsService
	logger           zerolog.Logger
}

// NewAnalyticsHandler creates a new analytics handler
func NewAnalyticsHandler(analyticsService *services.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{
		analyticsService: analyticsService,
		logger:           zerolog.New(os.Stdout).With().Timestamp().Logger(),
	}
}

// GetOverview handles GET /analytics/overview
func (h *AnalyticsHandler) GetOverview(c *fiber.Ctx) error {
	stats, err := h.analyticsService.GetOverview(c.Context())
	if err != nil {
		h.logger.Error().
			Err(err).
			Str("event", "analytics.overview.failed").
			Msg("Failed to get overview stats")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch overview statistics",
		})
	}

	return c.JSON(stats)
}

// GetTimeline handles GET /analytics/timeline?range=7d|30d|90d
func (h *AnalyticsHandler) GetTimeline(c *fiber.Ctx) error {
	rangeStr := c.Query("range", "7d") // Default to 7 days

	timeline, err := h.analyticsService.GetTimeline(c.Context(), rangeStr)
	if err != nil {
		h.logger.Error().
			Err(err).
			Str("event", "analytics.timeline.failed").
			Str("range", rangeStr).
			Msg("Failed to get timeline stats")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("Invalid range: %s", err.Error()),
		})
	}

	return c.JSON(timeline)
}

// GetTopLinks handles GET /analytics/top-links?limit=10
func (h *AnalyticsHandler) GetTopLinks(c *fiber.Ctx) error {
	limitStr := c.Query("limit", "10")
	limit := 10

	if limitStr != "" {
		var err error
		limit, err = strconv.Atoi(limitStr)
		if err != nil || limit <= 0 {
			limit = 10
		}
	}

	links, err := h.analyticsService.GetTopLinks(c.Context(), limit)
	if err != nil {
		h.logger.Error().
			Err(err).
			Str("event", "analytics.top_links.failed").
			Msg("Failed to get top links")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch top links",
		})
	}

	return c.JSON(links)
}

// GetEmailEvents handles GET /analytics/events/:messageId
func (h *AnalyticsHandler) GetEmailEvents(c *fiber.Ctx) error {
	messageID := c.Params("messageId")
	if messageID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "messageId is required",
		})
	}

	events, err := h.analyticsService.GetEmailEvents(c.Context(), messageID)
	if err != nil {
		h.logger.Error().
			Err(err).
			Str("event", "analytics.email_events.failed").
			Str("message_id", messageID).
			Msg("Failed to get email events")
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Email not found or no events available",
		})
	}

	return c.JSON(fiber.Map{
		"message_id": messageID,
		"events":     events,
	})
}
