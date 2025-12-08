package middleware

import (
	"os"
	"strings"

	"backend/internal/auth"
	"backend/internal/users"

	"github.com/gofiber/fiber/v2"
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

		// Extract token (Bearer <token>)
		token := strings.TrimPrefix(authHeader, "Bearer ")
		token = strings.TrimSpace(token)

		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authorization token required",
			})
		}

		// Validate JWT token
		claims, err := auth.ValidateToken(token)
		if err != nil {
			logger.Warn().
				Err(err).
				Str("token", token[:min(20, len(token))]+"...").
				Msg("Invalid JWT token")
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		// Get user from database to verify it still exists and is active
		user, err := userService.GetUser(c.Context(), claims.UserID)
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

		// Verify role hasn't changed (optional security check)
		if user.Role != claims.Role {
			logger.Warn().
				Str("user_id", user.ID.String()).
				Str("token_role", claims.Role).
				Str("user_role", user.Role).
				Msg("User role changed, token invalidated")
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token invalidated due to role change",
			})
		}

		// Store user and claims in context
		c.Locals("user", user)
		c.Locals("user_id", user.ID)
		c.Locals("user_role", user.Role)
		c.Locals("claims", claims)

		return c.Next()
	}
}

// min returns the minimum of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
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
