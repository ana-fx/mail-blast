package contacts

import (
	"backend/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository interface {
	GetAll() ([]models.Contact, error)
	GetByID(id uuid.UUID) (*models.Contact, error)
	Create(contact *models.Contact) error
	Update(contact *models.Contact) error
	Delete(id uuid.UUID) error
}

type contactRepository struct {
	db *gorm.DB
}

// NewRepository creates a new contact repository
func NewRepository(db *gorm.DB) Repository {
	return &contactRepository{
		db: db,
	}
}

// GetAll retrieves all contacts
func (r *contactRepository) GetAll() ([]models.Contact, error) {
	var contacts []models.Contact
	if err := r.db.Find(&contacts).Error; err != nil {
		return nil, err
	}
	return contacts, nil
}

// GetByID retrieves a contact by ID
func (r *contactRepository) GetByID(id uuid.UUID) (*models.Contact, error) {
	var contact models.Contact
	if err := r.db.First(&contact, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &contact, nil
}

// Create creates a new contact
func (r *contactRepository) Create(contact *models.Contact) error {
	return r.db.Create(contact).Error
}

// Update updates an existing contact
func (r *contactRepository) Update(contact *models.Contact) error {
	return r.db.Save(contact).Error
}

// Delete deletes a contact by ID
func (r *contactRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Contact{}, "id = ?", id).Error
}
