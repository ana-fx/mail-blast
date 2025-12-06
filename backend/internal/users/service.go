package users

import (
	"context"
	"fmt"
	"os"

	"backend/internal/models"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"github.com/rs/zerolog"
)

// Service defines user service interface
type Service interface {
	CreateUser(ctx context.Context, req *CreateUserRequest) (*models.User, error)
	GetUser(ctx context.Context, id uuid.UUID) (*models.User, error)
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)
	GetUsersByClient(ctx context.Context, clientID uuid.UUID) ([]models.User, error)
	UpdateUser(ctx context.Context, id uuid.UUID, req *UpdateUserRequest) (*models.User, error)
	DeleteUser(ctx context.Context, id uuid.UUID) error
	ListUsers(ctx context.Context, limit, offset int) ([]models.User, int64, error)
	Authenticate(ctx context.Context, email, password string) (*models.User, error)
}

type service struct {
	repo   Repository
	logger zerolog.Logger
}

// NewService creates a new user service
func NewService(repo Repository) Service {
	return &service{
		repo:   repo,
		logger: zerolog.New(os.Stdout).With().Timestamp().Logger(),
	}
}

// CreateUserRequest represents request to create a user
type CreateUserRequest struct {
	Email    string     `json:"email"`
	Password string     `json:"password"`
	Name     string     `json:"name"`
	Role     string     `json:"role"` // admin, user, client
	ClientID *uuid.UUID `json:"client_id,omitempty"`
	Status   string     `json:"status"` // active, inactive, suspended
}

// UpdateUserRequest represents request to update a user
type UpdateUserRequest struct {
	Email    *string    `json:"email,omitempty"`
	Password *string    `json:"password,omitempty"`
	Name     *string    `json:"name,omitempty"`
	Role     *string    `json:"role,omitempty"`
	ClientID *uuid.UUID `json:"client_id,omitempty"`
	Status   *string    `json:"status,omitempty"`
}

// CreateUser creates a new user
func (s *service) CreateUser(ctx context.Context, req *CreateUserRequest) (*models.User, error) {
	// Validate required fields
	if req.Email == "" {
		return nil, fmt.Errorf("email is required")
	}
	if req.Password == "" {
		return nil, fmt.Errorf("password is required")
	}
	if req.Name == "" {
		return nil, fmt.Errorf("name is required")
	}

	// Validate role
	if req.Role == "" {
		req.Role = "user"
	}
	if req.Role != "admin" && req.Role != "user" && req.Role != "client" {
		return nil, fmt.Errorf("invalid role: must be admin, user, or client")
	}

	// Validate status
	if req.Status == "" {
		req.Status = "active"
	}
	if req.Status != "active" && req.Status != "inactive" && req.Status != "suspended" {
		return nil, fmt.Errorf("invalid status: must be active, inactive, or suspended")
	}

	// Check if email already exists
	_, err := s.repo.GetByEmail(ctx, req.Email)
	if err == nil {
		return nil, fmt.Errorf("email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	user := &models.User{
		Email:    req.Email,
		Password: string(hashedPassword),
		Name:     req.Name,
		Role:     req.Role,
		ClientID: req.ClientID,
		Status:   req.Status,
	}

	if err := s.repo.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Don't return password
	user.Password = ""

	s.logger.Info().
		Str("user_id", user.ID.String()).
		Str("email", user.Email).
		Str("role", user.Role).
		Msg("User created successfully")

	return user, nil
}

// GetUser retrieves a user by ID
func (s *service) GetUser(ctx context.Context, id uuid.UUID) (*models.User, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	// Don't return password
	user.Password = ""
	return user, nil
}

// GetUserByEmail retrieves a user by email
func (s *service) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	user, err := s.repo.GetByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	// Don't return password
	user.Password = ""
	return user, nil
}

// GetUsersByClient retrieves all users for a client
func (s *service) GetUsersByClient(ctx context.Context, clientID uuid.UUID) ([]models.User, error) {
	users, err := s.repo.GetByClientID(ctx, clientID)
	if err != nil {
		return nil, err
	}
	// Don't return passwords
	for i := range users {
		users[i].Password = ""
	}
	return users, nil
}

// UpdateUser updates a user
func (s *service) UpdateUser(ctx context.Context, id uuid.UUID, req *UpdateUserRequest) (*models.User, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.Email != nil {
		// Check if new email already exists
		if *req.Email != user.Email {
			_, err := s.repo.GetByEmail(ctx, *req.Email)
			if err == nil {
				return nil, fmt.Errorf("email already exists")
			}
		}
		user.Email = *req.Email
	}
	if req.Password != nil {
		// Hash new password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(*req.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, fmt.Errorf("failed to hash password: %w", err)
		}
		user.Password = string(hashedPassword)
	}
	if req.Name != nil {
		user.Name = *req.Name
	}
	if req.Role != nil {
		if *req.Role != "admin" && *req.Role != "user" && *req.Role != "client" {
			return nil, fmt.Errorf("invalid role: must be admin, user, or client")
		}
		user.Role = *req.Role
	}
	if req.ClientID != nil {
		user.ClientID = req.ClientID
	}
	if req.Status != nil {
		if *req.Status != "active" && *req.Status != "inactive" && *req.Status != "suspended" {
			return nil, fmt.Errorf("invalid status: must be active, inactive, or suspended")
		}
		user.Status = *req.Status
	}

	if err := s.repo.Update(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	// Don't return password
	user.Password = ""

	return user, nil
}

// DeleteUser deletes a user
func (s *service) DeleteUser(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

// ListUsers retrieves users with pagination
func (s *service) ListUsers(ctx context.Context, limit, offset int) ([]models.User, int64, error) {
	users, total, err := s.repo.List(ctx, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	// Don't return passwords
	for i := range users {
		users[i].Password = ""
	}
	return users, total, nil
}

// Authenticate authenticates a user with email and password
func (s *service) Authenticate(ctx context.Context, email, password string) (*models.User, error) {
	user, err := s.repo.GetByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	// Check status
	if user.Status != "active" {
		return nil, fmt.Errorf("user account is not active")
	}

	// Update last login
	s.repo.UpdateLastLogin(ctx, user.ID)

	// Don't return password
	user.Password = ""

	return user, nil
}

