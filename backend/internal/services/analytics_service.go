package services

import (
	"context"
	"fmt"
	"strconv"

	"backend/internal/cache"
	"backend/internal/repositories"
)

// AnalyticsService provides analytics business logic
type AnalyticsService struct {
	analyticsRepo repositories.AnalyticsRepository
	cache         *cache.AnalyticsCache
}

// NewAnalyticsService creates a new analytics service
func NewAnalyticsService(analyticsRepo repositories.AnalyticsRepository) *AnalyticsService {
	return &AnalyticsService{
		analyticsRepo: analyticsRepo,
		cache:         cache.NewAnalyticsCache(),
	}
}

// GetOverview returns overall email statistics (with caching)
func (s *AnalyticsService) GetOverview(ctx context.Context) (*repositories.OverviewStats, error) {
	// Check cache first
	if cached, ok := s.cache.GetOverview(); ok {
		return cached, nil
	}

	// Fetch from repository
	stats, err := s.analyticsRepo.GetOverviewStats(ctx)
	if err != nil {
		return nil, err
	}

	// Cache the result
	s.cache.SetOverview(stats)

	return stats, nil
}

// GetTimeline returns timeline statistics for the specified range (with caching)
// range can be "7d", "30d", or "90d"
func (s *AnalyticsService) GetTimeline(ctx context.Context, rangeStr string) ([]repositories.TimelineStat, error) {
	// Check cache first
	if cached, ok := s.cache.GetTimeline(rangeStr); ok {
		return cached, nil
	}

	days, err := parseRange(rangeStr)
	if err != nil {
		return nil, fmt.Errorf("invalid range: %w", err)
	}

	// Fetch from repository
	stats, err := s.analyticsRepo.GetTimelineStats(ctx, days)
	if err != nil {
		return nil, err
	}

	// Cache the result
	s.cache.SetTimeline(rangeStr, stats)

	return stats, nil
}

// GetTopLinks returns the most clicked URLs (with caching)
func (s *AnalyticsService) GetTopLinks(ctx context.Context, limit int) ([]repositories.TopLink, error) {
	if limit <= 0 {
		limit = 10 // Default limit
	}
	if limit > 100 {
		limit = 100 // Max limit
	}

	// Check cache first (only for default limit of 10)
	if limit == 10 {
		if cached, ok := s.cache.GetTopLinks(); ok {
			return cached, nil
		}
	}

	// Fetch from repository
	links, err := s.analyticsRepo.GetTopClickedLinks(ctx, limit)
	if err != nil {
		return nil, err
	}

	// Cache the result (only for default limit)
	if limit == 10 {
		s.cache.SetTopLinks(links)
	}

	return links, nil
}

// GetEmailEvents returns all events for a specific message ID
func (s *AnalyticsService) GetEmailEvents(ctx context.Context, messageID string) ([]interface{}, error) {
	events, err := s.analyticsRepo.GetEmailEvents(ctx, messageID)
	if err != nil {
		return nil, err
	}

	// Convert to response format
	result := make([]interface{}, 0, len(events))
	for _, event := range events {
		result = append(result, map[string]interface{}{
			"id":         event.ID.String(),
			"event_type": event.EventType,
			"meta":       event.Meta,
			"created_at": event.CreatedAt,
		})
	}

	return result, nil
}

// parseRange parses range string to days
func parseRange(rangeStr string) (int, error) {
	if len(rangeStr) < 2 {
		return 0, fmt.Errorf("invalid range format")
	}

	unit := rangeStr[len(rangeStr)-1:]
	valueStr := rangeStr[:len(rangeStr)-1]

	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return 0, fmt.Errorf("invalid range value: %w", err)
	}

	switch unit {
	case "d":
		return value, nil
	case "w":
		return value * 7, nil
	case "m":
		return value * 30, nil
	default:
		return 0, fmt.Errorf("invalid range unit: %s", unit)
	}
}
