package handlers

import (
	"encoding/json"

	"backend/internal/email"
	"backend/internal/queue"

	"github.com/gofiber/fiber/v2"
)

type EmailHandler struct{}

// NewEmailHandler creates a new email handler
func NewEmailHandler() *EmailHandler {
	return &EmailHandler{}
}

// SendEmailRequest represents the request body for sending email
type SendEmailRequest struct {
	To       string `json:"to"`
	Subject  string `json:"subject"`
	BodyHTML string `json:"body_html"`
	From     string `json:"from"`
}

// SendEmail handles POST /send-email
func (h *EmailHandler) SendEmail(c *fiber.Ctx) error {
	var req SendEmailRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if req.To == "" || req.Subject == "" || req.BodyHTML == "" || req.From == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "to, subject, body_html, and from are required",
		})
	}

	// Convert to EmailJob
	job := email.EmailJob{
		To:       req.To,
		Subject:  req.Subject,
		BodyHTML: req.BodyHTML,
		From:     req.From,
	}

	// Marshal to JSON
	jobData, err := json.Marshal(job)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to marshal job",
		})
	}

	// Enqueue into Redis
	if err := queue.Enqueue(jobData); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to queue email",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "queued",
	})
}
