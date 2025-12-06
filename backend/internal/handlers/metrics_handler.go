package handlers

import (
	"backend/internal/metrics"

	"github.com/gofiber/fiber/v2"
)

// MetricsHandler handles metrics endpoints
type MetricsHandler struct{}

// NewMetricsHandler creates a new metrics handler
func NewMetricsHandler() *MetricsHandler {
	return &MetricsHandler{}
}

// GetMetrics handles GET /metrics
func (h *MetricsHandler) GetMetrics(c *fiber.Ctx) error {
	m := metrics.GetMetrics()
	snapshot := m.GetSnapshot()

	return c.JSON(snapshot)
}
