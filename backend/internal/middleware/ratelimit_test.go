package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
)

func TestRateLimiter_Allow(t *testing.T) {
	limiter := NewRateLimiter(5, 1*time.Minute)

	// First 5 requests should be allowed
	for i := 0; i < 5; i++ {
		if !limiter.Allow("127.0.0.1") {
			t.Errorf("Request %d should be allowed", i+1)
		}
	}

	// 6th request should be blocked
	if limiter.Allow("127.0.0.1") {
		t.Error("6th request should be blocked")
	}
}

func TestRateLimitMiddleware(t *testing.T) {
	app := fiber.New()
	rateLimit := RateLimitMiddleware(2, 1*time.Minute)
	app.Get("/test", rateLimit, func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	// First 2 requests should succeed
	req1 := httptest.NewRequest("GET", "/test", nil)
	resp1, _ := app.Test(req1)
	if resp1.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp1.StatusCode)
	}

	req2 := httptest.NewRequest("GET", "/test", nil)
	resp2, _ := app.Test(req2)
	if resp2.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp2.StatusCode)
	}

	// 3rd request should be rate limited
	req3 := httptest.NewRequest("GET", "/test", nil)
	resp3, _ := app.Test(req3)
	if resp3.StatusCode != http.StatusTooManyRequests {
		t.Errorf("Expected status 429, got %d", resp3.StatusCode)
	}
}
