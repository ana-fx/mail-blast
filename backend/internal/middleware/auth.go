package middleware

import (
	"os"
	"strings"

	"backend/internal/users"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/rs/zerolog"
)

// AuthMiddleware validates user authentication
func AuthMiddleware(userService users.Service) fiber.Handler {
	logger := zerolog.New(os.Stdout).With().Timestamp().Logger()

	return func(c *fiber.Ctx) error {
		// Get token from header (Bearer token or API key)
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authorization header required",
			})
		}

		// Extract token (Bearer <token> or just <token>)
		token := strings.TrimPrefix(authHeader, "Bearer ")
		token = strings.TrimSpace(token)

		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid authorization token",
			})
		}

		// TODO: Validate JWT token or API key
		// For now, we'll extract user ID from token (if it's a UUID)
		// In production, you should use JWT validation
		userID, err := uuid.Parse(token)
		if err != nil {
			// If token is not UUID, treat it as API key
			// TODO: Implement API key validation
			logger.Warn().
				Str("token", token).
				Msg("Token validation not implemented")
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid token format",
			})
		}

		// Get user from database
		user, err := userService.GetUser(c.Context(), userID)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "User not found",
			})
		}

		// Check if user is active
		if user.Status != "active" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "User account is not active",
			})
		}

		// Store user in context
		c.Locals("user", user)
		c.Locals("user_id", user.ID)
		c.Locals("user_role", user.Role)

		return c.Next()
	}
}

// RequireRole middleware checks if user has required role
func RequireRole(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole, ok := c.Locals("user_role").(string)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "User role not found",
			})
		}

		// Check if user role is in allowed roles
		for _, role := range allowedRoles {
			if userRole == role {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Insufficient permissions",
		})
	}
}

// RequireAdmin middleware - shortcut for admin only
func RequireAdmin() fiber.Handler {
	return RequireRole("admin")
}

// RequireClientOrAdmin middleware - allows client users and admins
func RequireClientOrAdmin() fiber.Handler {
	return RequireRole("admin", "client")
}

