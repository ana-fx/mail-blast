package middleware

import (
	"backend/internal/metrics"
	"time"

	"github.com/gofiber/fiber/v2"
)

// MetricsMiddleware tracks HTTP request metrics
func MetricsMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()

		// Process request
		err := c.Next()

		// Record metrics
		duration := time.Since(start)
		m := metrics.GetMetrics()
		m.IncrementRequest()
		m.RecordResponseTime(duration)
		m.IncrementStatus(c.Response().StatusCode())

		if err != nil || c.Response().StatusCode() >= 400 {
			m.IncrementError()
		}

		return err
	}
}
