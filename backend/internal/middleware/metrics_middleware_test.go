package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/metrics"

	"github.com/gofiber/fiber/v2"
)

func TestMetricsMiddleware(t *testing.T) {
	app := fiber.New()
	app.Use(MetricsMiddleware())
	app.Get("/test", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	req := httptest.NewRequest("GET", "/test", nil)
	resp, _ := app.Test(req)

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	m := metrics.GetMetrics()
	snapshot := m.GetSnapshot()

	if snapshot.TotalRequests == 0 {
		t.Error("Expected total requests to be > 0")
	}
}
