package middleware

import (
	"os"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/rs/zerolog"
)

// RateLimiter provides simple in-memory rate limiting
type RateLimiter struct {
	visitors map[string]*visitor
	mu       sync.RWMutex
	rate     int           // requests per window
	window   time.Duration // time window
	logger   zerolog.Logger
}

type visitor struct {
	lastSeen time.Time
	count    int
}

// NewRateLimiter creates a new rate limiter
// rate: number of requests allowed
// window: time window (e.g., 1 minute)
func NewRateLimiter(rate int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*visitor),
		rate:     rate,
		window:   window,
		logger:   zerolog.New(os.Stdout).With().Timestamp().Logger(),
	}

	// Cleanup old visitors every minute
	go rl.cleanupVisitors()

	return rl
}

// cleanupVisitors removes old visitor entries to prevent memory leaks
func (rl *RateLimiter) cleanupVisitors() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for ip, v := range rl.visitors {
			if now.Sub(v.lastSeen) > rl.window*2 {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}

// Allow checks if a request should be allowed
func (rl *RateLimiter) Allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	v, exists := rl.visitors[ip]

	if !exists {
		rl.visitors[ip] = &visitor{
			lastSeen: now,
			count:    1,
		}
		return true
	}

	// Reset if window has passed
	if now.Sub(v.lastSeen) > rl.window {
		v.count = 1
		v.lastSeen = now
		return true
	}

	// Check if limit exceeded
	if v.count >= rl.rate {
		return false
	}

	v.count++
	v.lastSeen = now
	return true
}

// RateLimitMiddleware creates a Fiber middleware for rate limiting
func RateLimitMiddleware(rate int, window time.Duration) fiber.Handler {
	limiter := NewRateLimiter(rate, window)

	return func(c *fiber.Ctx) error {
		ip := c.IP()

		if !limiter.Allow(ip) {
			limiter.logger.Warn().
				Str("ip", ip).
				Str("path", c.Path()).
				Msg("Rate limit exceeded")

			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Rate limit exceeded",
			})
		}

		return c.Next()
	}
}
