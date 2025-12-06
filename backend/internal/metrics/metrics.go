package metrics

import (
	"sync"
	"time"
)

// Metrics tracks application metrics
type Metrics struct {
	mu sync.RWMutex

	// HTTP metrics
	TotalRequests    int64
	TotalErrors      int64
	RequestsByStatus map[int]int64

	// Email metrics
	EmailsSent      int64
	EmailsDelivered int64
	EmailsBounced   int64
	EmailsFailed    int64

	// Tracking metrics
	OpensTracked  int64
	ClicksTracked int64

	// Performance metrics
	AverageResponseTime time.Duration
	responseTimes       []time.Duration
	maxResponseTimes    int
}

var globalMetrics *Metrics
var once sync.Once

// GetMetrics returns the global metrics instance
func GetMetrics() *Metrics {
	once.Do(func() {
		globalMetrics = &Metrics{
			RequestsByStatus: make(map[int]int64),
			maxResponseTimes: 1000, // Keep last 1000 response times
		}
	})
	return globalMetrics
}

// IncrementRequest increments total request count
func (m *Metrics) IncrementRequest() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.TotalRequests++
}

// IncrementError increments error count
func (m *Metrics) IncrementError() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.TotalErrors++
}

// IncrementStatus increments count for a specific HTTP status code
func (m *Metrics) IncrementStatus(status int) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.RequestsByStatus[status]++
}

// RecordResponseTime records a response time
func (m *Metrics) RecordResponseTime(duration time.Duration) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.responseTimes = append(m.responseTimes, duration)
	if len(m.responseTimes) > m.maxResponseTimes {
		m.responseTimes = m.responseTimes[1:]
	}

	// Calculate average
	var total time.Duration
	for _, rt := range m.responseTimes {
		total += rt
	}
	if len(m.responseTimes) > 0 {
		m.AverageResponseTime = total / time.Duration(len(m.responseTimes))
	}
}

// IncrementEmailSent increments emails sent count
func (m *Metrics) IncrementEmailSent() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.EmailsSent++
}

// IncrementEmailDelivered increments emails delivered count
func (m *Metrics) IncrementEmailDelivered() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.EmailsDelivered++
}

// IncrementEmailBounced increments emails bounced count
func (m *Metrics) IncrementEmailBounced() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.EmailsBounced++
}

// IncrementEmailFailed increments emails failed count
func (m *Metrics) IncrementEmailFailed() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.EmailsFailed++
}

// IncrementOpenTracked increments opens tracked count
func (m *Metrics) IncrementOpenTracked() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.OpensTracked++
}

// IncrementClickTracked increments clicks tracked count
func (m *Metrics) IncrementClickTracked() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.ClicksTracked++
}

// GetSnapshot returns a snapshot of current metrics
func (m *Metrics) GetSnapshot() MetricsSnapshot {
	m.mu.RLock()
	defer m.mu.RUnlock()

	statusCopy := make(map[int]int64)
	for k, v := range m.RequestsByStatus {
		statusCopy[k] = v
	}

	return MetricsSnapshot{
		TotalRequests:       m.TotalRequests,
		TotalErrors:         m.TotalErrors,
		RequestsByStatus:    statusCopy,
		EmailsSent:          m.EmailsSent,
		EmailsDelivered:     m.EmailsDelivered,
		EmailsBounced:       m.EmailsBounced,
		EmailsFailed:        m.EmailsFailed,
		OpensTracked:        m.OpensTracked,
		ClicksTracked:       m.ClicksTracked,
		AverageResponseTime: m.AverageResponseTime,
	}
}

// MetricsSnapshot is a thread-safe snapshot of metrics
type MetricsSnapshot struct {
	TotalRequests       int64         `json:"total_requests"`
	TotalErrors         int64         `json:"total_errors"`
	RequestsByStatus    map[int]int64 `json:"requests_by_status"`
	EmailsSent          int64         `json:"emails_sent"`
	EmailsDelivered     int64         `json:"emails_delivered"`
	EmailsBounced       int64         `json:"emails_bounced"`
	EmailsFailed        int64         `json:"emails_failed"`
	OpensTracked        int64         `json:"opens_tracked"`
	ClicksTracked       int64         `json:"clicks_tracked"`
	AverageResponseTime time.Duration `json:"average_response_time_ms"`
}
