package cache

import (
	"testing"
	"time"

	"backend/internal/repositories"
)

func TestAnalyticsCache_Overview(t *testing.T) {
	cache := NewAnalyticsCache()

	// Initially empty
	stats, ok := cache.GetOverview()
	if ok {
		t.Error("Expected cache to be empty initially")
	}

	// Set cache
	stats = &repositories.OverviewStats{
		TotalSent:      100,
		TotalDelivered: 95,
		OpenRate:       0.5,
		ClickRate:      0.1,
	}
	cache.SetOverview(stats)

	// Should retrieve from cache
	cached, ok := cache.GetOverview()
	if !ok {
		t.Error("Expected to retrieve from cache")
	}
	if cached.TotalSent != 100 {
		t.Errorf("Expected TotalSent 100, got %d", cached.TotalSent)
	}
}

func TestAnalyticsCache_Timeline(t *testing.T) {
	cache := NewAnalyticsCache()

	// Set cache
	stats := []repositories.TimelineStat{
		{Date: "2025-02-01", Sent: 10, Delivered: 9},
	}
	cache.SetTimeline("7d", stats)

	// Should retrieve from cache
	cached, ok := cache.GetTimeline("7d")
	if !ok {
		t.Error("Expected to retrieve from cache")
	}
	if len(cached) != 1 {
		t.Errorf("Expected 1 item, got %d", len(cached))
	}
}

func TestAnalyticsCache_Expiration(t *testing.T) {
	cache := NewAnalyticsCache()

	// Set cache with very short TTL
	cache.overviewTTL = 1 * time.Millisecond
	stats := &repositories.OverviewStats{TotalSent: 100}
	cache.SetOverview(stats)

	// Wait for expiration
	time.Sleep(10 * time.Millisecond)

	// Should not retrieve expired cache
	_, ok := cache.GetOverview()
	if ok {
		t.Error("Expected cache to be expired")
	}
}
