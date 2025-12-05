package contacts

import (
	"backend/internal/models"
	"errors"
	"strings"

	"github.com/google/uuid"
)

type Service interface {
	GetAll() ([]models.Contact, error)
	GetByID(id uuid.UUID) (*models.Contact, error)
	Create(contact *models.Contact) error
	Update(id uuid.UUID, contact *models.Contact) error
	Delete(id uuid.UUID) error
}

type contactService struct {
	repo Repository
}

// NewService creates a new contact service
func NewService(repo Repository) Service {
	return &contactService{
		repo: repo,
	}
}

// GetAll retrieves all contacts
func (s *contactService) GetAll() ([]models.Contact, error) {
	return s.repo.GetAll()
}

// GetByID retrieves a contact by ID
func (s *contactService) GetByID(id uuid.UUID) (*models.Contact, error) {
	return s.repo.GetByID(id)
}

// Create creates a new contact with validation
func (s *contactService) Create(contact *models.Contact) error {
	// Validate email format
	if !isValidEmail(contact.Email) {
		return errors.New("invalid email format")
	}

	// Set default status if not provided
	if contact.Status == "" {
		contact.Status = "active"
	}

	return s.repo.Create(contact)
}

// Update updates an existing contact
func (s *contactService) Update(id uuid.UUID, contact *models.Contact) error {
	// Check if contact exists
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}

	// Validate email format if provided
	if contact.Email != "" && !isValidEmail(contact.Email) {
		return errors.New("invalid email format")
	}

	// Update fields
	if contact.Name != "" {
		existing.Name = contact.Name
	}
	if contact.Email != "" {
		existing.Email = contact.Email
	}
	if contact.Status != "" {
		existing.Status = contact.Status
	}
	if contact.ClientID != uuid.Nil {
		existing.ClientID = contact.ClientID
	}

	return s.repo.Update(existing)
}

// Delete deletes a contact by ID
func (s *contactService) Delete(id uuid.UUID) error {
	// Check if contact exists
	_, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	return s.repo.Delete(id)
}

// isValidEmail performs basic email validation
func isValidEmail(email string) bool {
	if email == "" {
		return false
	}

	email = strings.TrimSpace(email)

	// Basic validation: must contain @ and at least one dot after @
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return false
	}

	if len(parts[0]) == 0 || len(parts[1]) == 0 {
		return false
	}

	// Check for at least one dot in domain
	if !strings.Contains(parts[1], ".") {
		return false
	}

	return true
}
