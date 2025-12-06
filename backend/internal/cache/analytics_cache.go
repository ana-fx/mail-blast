package cache

import (
	"time"

	"backend/internal/repositories"
)

// AnalyticsCache provides caching for analytics queries
type AnalyticsCache struct {
	overviewCache *CacheEntry
	timelineCache map[string]*CacheEntry // key: range string
	topLinksCache *CacheEntry
	overviewTTL   time.Duration
	timelineTTL   time.Duration
	topLinksTTL   time.Duration
}

// CacheEntry represents a cached value with expiration
type CacheEntry struct {
	Data      interface{}
	ExpiresAt time.Time
}

// NewAnalyticsCache creates a new analytics cache
func NewAnalyticsCache() *AnalyticsCache {
	return &AnalyticsCache{
		timelineCache: make(map[string]*CacheEntry),
		overviewTTL:   5 * time.Minute,  // Cache overview for 5 minutes
		timelineTTL:   2 * time.Minute,  // Cache timeline for 2 minutes
		topLinksTTL:   10 * time.Minute, // Cache top links for 10 minutes
	}
}

// GetOverview returns cached overview stats if available and not expired
func (c *AnalyticsCache) GetOverview() (*repositories.OverviewStats, bool) {
	if c.overviewCache == nil {
		return nil, false
	}

	if time.Now().After(c.overviewCache.ExpiresAt) {
		c.overviewCache = nil
		return nil, false
	}

	stats, ok := c.overviewCache.Data.(*repositories.OverviewStats)
	return stats, ok
}

// SetOverview caches overview stats
func (c *AnalyticsCache) SetOverview(stats *repositories.OverviewStats) {
	c.overviewCache = &CacheEntry{
		Data:      stats,
		ExpiresAt: time.Now().Add(c.overviewTTL),
	}
}

// GetTimeline returns cached timeline stats if available and not expired
func (c *AnalyticsCache) GetTimeline(rangeStr string) ([]repositories.TimelineStat, bool) {
	entry, exists := c.timelineCache[rangeStr]
	if !exists {
		return nil, false
	}

	if time.Now().After(entry.ExpiresAt) {
		delete(c.timelineCache, rangeStr)
		return nil, false
	}

	stats, ok := entry.Data.([]repositories.TimelineStat)
	return stats, ok
}

// SetTimeline caches timeline stats
func (c *AnalyticsCache) SetTimeline(rangeStr string, stats []repositories.TimelineStat) {
	c.timelineCache[rangeStr] = &CacheEntry{
		Data:      stats,
		ExpiresAt: time.Now().Add(c.timelineTTL),
	}
}

// GetTopLinks returns cached top links if available and not expired
func (c *AnalyticsCache) GetTopLinks() ([]repositories.TopLink, bool) {
	if c.topLinksCache == nil {
		return nil, false
	}

	if time.Now().After(c.topLinksCache.ExpiresAt) {
		c.topLinksCache = nil
		return nil, false
	}

	links, ok := c.topLinksCache.Data.([]repositories.TopLink)
	return links, ok
}

// SetTopLinks caches top links
func (c *AnalyticsCache) SetTopLinks(links []repositories.TopLink) {
	c.topLinksCache = &CacheEntry{
		Data:      links,
		ExpiresAt: time.Now().Add(c.topLinksTTL),
	}
}

// Invalidate clears all cache entries
func (c *AnalyticsCache) Invalidate() {
	c.overviewCache = nil
	c.topLinksCache = nil
	c.timelineCache = make(map[string]*CacheEntry)
}
