package repositories

import (
	"context"
	"encoding/json"
	"sort"
	"time"

	"backend/internal/db"
	"backend/internal/models"
)

// AnalyticsRepository provides analytics queries
type AnalyticsRepository interface {
	GetOverviewStats(ctx context.Context) (*OverviewStats, error)
	GetTimelineStats(ctx context.Context, days int) ([]TimelineStat, error)
	GetTopClickedLinks(ctx context.Context, limit int) ([]TopLink, error)
	GetEmailEvents(ctx context.Context, messageID string) ([]models.EmailEventRecord, error)
}

type analyticsRepository struct{}

// NewAnalyticsRepository creates a new analytics repository
func NewAnalyticsRepository() AnalyticsRepository {
	return &analyticsRepository{}
}

// OverviewStats represents overall email statistics
type OverviewStats struct {
	TotalSent      int64   `json:"total_sent"`
	TotalDelivered int64   `json:"total_delivered"`
	TotalBounced   int64   `json:"total_bounced"`
	TotalComplaint int64   `json:"total_complaint"`
	TotalFailed    int64   `json:"total_failed"`
	OpenRate       float64 `json:"open_rate"`
	ClickRate      float64 `json:"click_rate"`
}

// TimelineStat represents daily statistics
type TimelineStat struct {
	Date       string `json:"date"`
	Sent       int64  `json:"sent"`
	Delivered  int64  `json:"delivered"`
	Opens      int64  `json:"opens"`
	Clicks     int64  `json:"clicks"`
	Bounces    int64  `json:"bounces"`
	Complaints int64  `json:"complaints"`
}

// TopLink represents a top clicked link
type TopLink struct {
	URL         string    `json:"url"`
	ClickCount  int64     `json:"click_count"`
	LastClicked time.Time `json:"last_clicked"`
}

// GetOverviewStats returns overall email statistics
func (r *analyticsRepository) GetOverviewStats(ctx context.Context) (*OverviewStats, error) {
	stats := &OverviewStats{}

	// Count total sent (all emails)
	if err := db.DB.WithContext(ctx).
		Model(&models.EmailMessageRecord{}).
		Count(&stats.TotalSent).Error; err != nil {
		return nil, err
	}

	// Count by status
	if err := db.DB.WithContext(ctx).
		Model(&models.EmailMessageRecord{}).
		Where("status = ?", "delivered").
		Count(&stats.TotalDelivered).Error; err != nil {
		return nil, err
	}

	if err := db.DB.WithContext(ctx).
		Model(&models.EmailMessageRecord{}).
		Where("status = ?", "bounced").
		Count(&stats.TotalBounced).Error; err != nil {
		return nil, err
	}

	if err := db.DB.WithContext(ctx).
		Model(&models.EmailMessageRecord{}).
		Where("status = ?", "complaint").
		Count(&stats.TotalComplaint).Error; err != nil {
		return nil, err
	}

	if err := db.DB.WithContext(ctx).
		Model(&models.EmailMessageRecord{}).
		Where("status = ?", "failed").
		Count(&stats.TotalFailed).Error; err != nil {
		return nil, err
	}

	// Count open events
	var openCount int64
	if err := db.DB.WithContext(ctx).
		Model(&models.EmailEventRecord{}).
		Where("event_type = ?", "open").
		Count(&openCount).Error; err != nil {
		return nil, err
	}

	// Count click events
	var clickCount int64
	if err := db.DB.WithContext(ctx).
		Model(&models.EmailEventRecord{}).
		Where("event_type = ?", "click").
		Count(&clickCount).Error; err != nil {
		return nil, err
	}

	// Calculate rates
	if stats.TotalDelivered > 0 {
		stats.OpenRate = float64(openCount) / float64(stats.TotalDelivered)
		stats.ClickRate = float64(clickCount) / float64(stats.TotalDelivered)
	}

	return stats, nil
}

// GetTimelineStats returns daily statistics for the specified number of days
func (r *analyticsRepository) GetTimelineStats(ctx context.Context, days int) ([]TimelineStat, error) {
	// Calculate start date
	startDate := time.Now().AddDate(0, 0, -days)

	// Query sent emails grouped by date
	type SentCount struct {
		Date  string
		Count int64
	}
	var sentCounts []SentCount
	if err := db.DB.WithContext(ctx).
		Model(&models.EmailMessageRecord{}).
		Select("DATE(created_at) as date, COUNT(*) as count").
		Where("created_at >= ?", startDate).
		Group("DATE(created_at)").
		Order("date ASC").
		Scan(&sentCounts).Error; err != nil {
		return nil, err
	}

	// Query delivered emails grouped by date
	type DeliveredCount struct {
		Date  string
		Count int64
	}
	var deliveredCounts []DeliveredCount
	if err := db.DB.WithContext(ctx).
		Model(&models.EmailMessageRecord{}).
		Select("DATE(updated_at) as date, COUNT(*) as count").
		Where("status = ? AND updated_at >= ?", "delivered", startDate).
		Group("DATE(updated_at)").
		Order("date ASC").
		Scan(&deliveredCounts).Error; err != nil {
		return nil, err
	}

	// Query events grouped by date
	type EventCount struct {
		Date  string
		Type  string
		Count int64
	}
	var eventCounts []EventCount
	if err := db.DB.WithContext(ctx).
		Model(&models.EmailEventRecord{}).
		Select("DATE(created_at) as date, event_type as type, COUNT(*) as count").
		Where("created_at >= ? AND event_type IN (?, ?, ?, ?)", startDate, "open", "click", "bounce", "complaint").
		Group("DATE(created_at), event_type").
		Order("date ASC").
		Scan(&eventCounts).Error; err != nil {
		return nil, err
	}

	// Build date map
	dateMap := make(map[string]*TimelineStat)

	// Initialize all dates in range
	for i := 0; i < days; i++ {
		date := startDate.AddDate(0, 0, i).Format("2006-01-02")
		dateMap[date] = &TimelineStat{
			Date:       date,
			Sent:       0,
			Delivered:  0,
			Opens:      0,
			Clicks:     0,
			Bounces:    0,
			Complaints: 0,
		}
	}

	// Populate sent counts
	for _, sc := range sentCounts {
		if stat, ok := dateMap[sc.Date]; ok {
			stat.Sent = sc.Count
		}
	}

	// Populate delivered counts
	for _, dc := range deliveredCounts {
		if stat, ok := dateMap[dc.Date]; ok {
			stat.Delivered = dc.Count
		}
	}

	// Populate event counts
	for _, ec := range eventCounts {
		if stat, ok := dateMap[ec.Date]; ok {
			switch ec.Type {
			case "open":
				stat.Opens = ec.Count
			case "click":
				stat.Clicks = ec.Count
			case "bounce":
				stat.Bounces = ec.Count
			case "complaint":
				stat.Complaints = ec.Count
			}
		}
	}

	// Convert map to slice and sort by date
	result := make([]TimelineStat, 0, len(dateMap))
	for i := 0; i < days; i++ {
		date := startDate.AddDate(0, 0, i).Format("2006-01-02")
		if stat, ok := dateMap[date]; ok {
			result = append(result, *stat)
		}
	}

	return result, nil
}

// GetTopClickedLinks returns the most clicked URLs
func (r *analyticsRepository) GetTopClickedLinks(ctx context.Context, limit int) ([]TopLink, error) {
	// Get all click events
	var events []models.EmailEventRecord
	if err := db.DB.WithContext(ctx).
		Where("event_type = ?", "click").
		Order("created_at DESC").
		Find(&events).Error; err != nil {
		return nil, err
	}

	// Aggregate by URL from metadata
	urlMap := make(map[string]*TopLink)
	for _, event := range events {
		// Parse metadata to extract URL
		var meta map[string]interface{}
		if err := json.Unmarshal(event.Meta, &meta); err != nil {
			continue
		}

		url, ok := meta["url"].(string)
		if !ok || url == "" {
			continue
		}

		if link, exists := urlMap[url]; exists {
			link.ClickCount++
			if event.CreatedAt.After(link.LastClicked) {
				link.LastClicked = event.CreatedAt
			}
		} else {
			urlMap[url] = &TopLink{
				URL:         url,
				ClickCount:  1,
				LastClicked: event.CreatedAt,
			}
		}
	}

	// Convert to slice and sort by click count
	result := make([]TopLink, 0, len(urlMap))
	for _, link := range urlMap {
		result = append(result, *link)
	}

	// Sort by click count (descending)
	sort.Slice(result, func(i, j int) bool {
		return result[i].ClickCount > result[j].ClickCount
	})

	// Limit results
	if limit > 0 && limit < len(result) {
		result = result[:limit]
	}

	return result, nil
}

// GetEmailEvents returns all events for a specific message ID
func (r *analyticsRepository) GetEmailEvents(ctx context.Context, messageID string) ([]models.EmailEventRecord, error) {
	// First, find the email by message ID
	var email models.EmailMessageRecord
	if err := db.DB.WithContext(ctx).
		Where("message_id = ?", messageID).
		First(&email).Error; err != nil {
		return nil, err
	}

	// Get all events for this email
	var events []models.EmailEventRecord
	if err := db.DB.WithContext(ctx).
		Where("email_id = ?", email.ID).
		Order("created_at ASC").
		Find(&events).Error; err != nil {
		return nil, err
	}

	return events, nil
}
