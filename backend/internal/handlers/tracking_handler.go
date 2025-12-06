package handlers

import (
	"encoding/base64"
	"net/url"
	"os"
	"strings"

	"backend/internal/services"
	"backend/internal/tracking"

	"github.com/gofiber/fiber/v2"
	"github.com/rs/zerolog"
)

type TrackingHandler struct {
	TrackingService *services.TrackingService
	MessageTracker  *tracking.MessageTracker
	logger          zerolog.Logger
}

// NewTrackingHandler creates a new tracking handler
func NewTrackingHandler(trackingService *services.TrackingService, messageTracker *tracking.MessageTracker) *TrackingHandler {
	return &TrackingHandler{
		TrackingService: trackingService,
		MessageTracker:  messageTracker,
		logger:          zerolog.New(os.Stdout).With().Timestamp().Logger(),
	}
}

// isValidURL validates that a URL is safe for redirect
// Only allows http:// and https:// URLs
// Rejects: javascript:, data:, file:, protocol-relative (//), relative URLs, empty URLs
func isValidURL(urlStr string) bool {
	if urlStr == "" {
		return false
	}

	// Reject protocol-relative URLs (//evil.com)
	if strings.HasPrefix(urlStr, "//") {
		return false
	}

	// Parse URL
	parsed, err := url.Parse(urlStr)
	if err != nil {
		return false
	}

	// Must have a scheme
	if parsed.Scheme == "" {
		return false
	}

	// Only allow http and https schemes
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return false
	}

	// Must have a host
	if parsed.Host == "" {
		return false
	}

	return true
}

// TrackOpen handles open tracking pixel requests
func (h *TrackingHandler) TrackOpen(c *fiber.Ctx) error {
	// Get path parameter (wildcard captures everything after /track/open/)
	path := c.Params("*")
	if path == "" {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	// Remove leading slash if present
	path = strings.TrimPrefix(path, "/")

	// Extract messageId by removing .png extension
	messageID := strings.TrimSuffix(path, ".png")
	if messageID == "" {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	ip := c.IP()
	ua := string(c.Request().Header.UserAgent())

	meta := map[string]interface{}{
		"ip":         ip,
		"user_agent": ua,
	}

	// Record open event using MessageTracker
	if h.MessageTracker != nil {
		if err := h.MessageTracker.ProcessOpenEvent(c.Context(), messageID); err != nil {
			h.logger.Error().
				Err(err).
				Str("event", "email.open.failed").
				Str("mid", messageID).
				Msg("Failed to record open event")
			// Continue to return pixel even if recording fails
		}
	} else {
		// Fallback to TrackingService for backward compatibility
		if err := h.TrackingService.RecordEvent(c.Context(), messageID, "open", meta); err != nil {
			h.logger.Error().
				Err(err).
				Str("event", "email.open.failed").
				Str("mid", messageID).
				Msg("Failed to record open event")
		}
	}

	// Log open event
	h.logger.Info().
		Str("event", "email.open").
		Str("mid", messageID).
		Str("ip", ip).
		Str("ua", ua).
		Msg("Email opened")

	// Return transparent 1x1 pixel from tracking package
	c.Set("Content-Type", "image/gif")
	c.Set("Cache-Control", "no-cache, no-store, must-revalidate")
	c.Set("Pragma", "no-cache")
	c.Set("Expires", "0")
	return c.Send(tracking.PixelGIF)
}

// TrackClick handles click tracking redirect requests
func (h *TrackingHandler) TrackClick(c *fiber.Ctx) error {
	messageID := c.Params("messageId")
	encodedURL := c.Query("url")

	if messageID == "" || encodedURL == "" {
		return c.Status(fiber.StatusBadRequest).SendString("missing url")
	}

	// Decode base64 URL
	decodedURL, err := base64.URLEncoding.DecodeString(encodedURL)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("invalid url")
	}

	targetURL := string(decodedURL)

	// Validate URL before redirect (CRITICAL: Prevent open redirect)
	if !isValidURL(targetURL) {
		h.logger.Warn().
			Str("event", "email.click.invalid_url").
			Str("mid", messageID).
			Str("url", targetURL).
			Msg("Invalid or dangerous URL rejected")
		return c.Status(fiber.StatusBadRequest).SendString("invalid url")
	}

	ip := c.IP()
	ua := string(c.Request().Header.UserAgent())

	// Record click event using MessageTracker
	if h.MessageTracker != nil {
		if err := h.MessageTracker.ProcessClickEvent(c.Context(), messageID, targetURL); err != nil {
			h.logger.Error().
				Err(err).
				Str("event", "email.click.failed").
				Str("mid", messageID).
				Str("url", targetURL).
				Msg("Failed to record click event")
			// Continue to redirect even if recording fails
		}
	} else {
		// Fallback to TrackingService for backward compatibility
		meta := map[string]interface{}{
			"ip":         ip,
			"user_agent": ua,
			"target":     targetURL,
		}
		if err := h.TrackingService.RecordEvent(c.Context(), messageID, "click", meta); err != nil {
			h.logger.Error().
				Err(err).
				Str("event", "email.click.failed").
				Str("mid", messageID).
				Str("url", targetURL).
				Msg("Failed to record click event")
		}
	}

	// Log click event
	h.logger.Info().
		Str("event", "email.click").
		Str("mid", messageID).
		Str("url", targetURL).
		Str("ip", ip).
		Str("ua", ua).
		Msg("Link clicked")

	return c.Redirect(targetURL, fiber.StatusFound)
}
