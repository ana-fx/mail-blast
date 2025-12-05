package contacts

import (
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type Handler struct {
	service Service
}

// NewHandler creates a new contact handler
func NewHandler(service Service) *Handler {
	return &Handler{
		service: service,
	}
}

// CreateRequest represents the request body for creating a contact
type CreateRequest struct {
	ClientID string `json:"client_id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
}

// UpdateRequest represents the request body for updating a contact
type UpdateRequest struct {
	ClientID string `json:"client_id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Status   string `json:"status"`
}

// Create handles POST /contacts
func (h *Handler) Create(c *fiber.Ctx) error {
	var req CreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if req.Name == "" || req.Email == "" || req.ClientID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "name, email, and client_id are required",
		})
	}

	// Parse client_id
	clientID, err := uuid.Parse(req.ClientID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid client_id format",
		})
	}

	contact := &models.Contact{
		ClientID: clientID,
		Name:     req.Name,
		Email:    req.Email,
		Status:   "active", // Default status
	}

	if err := h.service.Create(contact); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(contact)
}

// List handles GET /contacts
func (h *Handler) List(c *fiber.Ctx) error {
	contacts, err := h.service.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve contacts",
		})
	}

	return c.Status(fiber.StatusOK).JSON(contacts)
}

// GetByID handles GET /contacts/:id
func (h *Handler) GetByID(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid id format",
		})
	}

	contact, err := h.service.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "contact not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(contact)
}

// Update handles PUT /contacts/:id
func (h *Handler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid id format",
		})
	}

	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	contact := &models.Contact{
		Name:   req.Name,
		Email:  req.Email,
		Status: req.Status,
	}

	// Parse client_id if provided
	if req.ClientID != "" {
		clientID, err := uuid.Parse(req.ClientID)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid client_id format",
			})
		}
		contact.ClientID = clientID
	}

	if err := h.service.Update(id, contact); err != nil {
		if err.Error() == "record not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "contact not found",
			})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Retrieve updated contact
	updated, err := h.service.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve updated contact",
		})
	}

	return c.Status(fiber.StatusOK).JSON(updated)
}

// Delete handles DELETE /contacts/:id
func (h *Handler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid id format",
		})
	}

	if err := h.service.Delete(id); err != nil {
		if err.Error() == "record not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "contact not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete contact",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "contact deleted successfully",
	})
}
