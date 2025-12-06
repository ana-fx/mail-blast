package handlers

import (
	"encoding/base64"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
)

func assertEqual(t *testing.T, expected, actual interface{}, msg string) {
	if expected != actual {
		t.Errorf("%s: expected %v, got %v", msg, expected, actual)
	}
}

func TestIsValidURL(t *testing.T) {
	tests := []struct {
		name     string
		url      string
		expected bool
	}{
		{"Valid HTTPS URL", "https://example.com", true},
		{"Valid HTTP URL", "http://example.com", true},
		{"Valid URL with path", "https://example.com/path?query=value", true},
		{"JavaScript URL", "javascript:alert(1)", false},
		{"Data URL", "data:text/html,<script>alert(1)</script>", false},
		{"File URL", "file:///etc/passwd", false},
		{"Protocol-relative URL", "//evil.com", false},
		{"Relative URL", "../../etc/passwd", false},
		{"Empty URL", "", false},
		{"URL without scheme", "example.com", false},
		{"URL without host", "https://", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := isValidURL(tt.url)
			assertEqual(t, tt.expected, result, "URL: "+tt.url)
		})
	}
}

func TestTrackClick_InvalidURL(t *testing.T) {
	app := fiber.New()
	handler := &TrackingHandler{}

	app.Get("/track/click/:messageId", handler.TrackClick)

	// Test JavaScript URL
	jsURL := base64.URLEncoding.EncodeToString([]byte("javascript:alert(1)"))
	req := httptest.NewRequest("GET", "/track/click/test-123?url="+jsURL, nil)
	resp, _ := app.Test(req)

	assertEqual(t, http.StatusBadRequest, resp.StatusCode, "JavaScript URL should be rejected")

	// Test protocol-relative URL
	protoURL := base64.URLEncoding.EncodeToString([]byte("//evil.com"))
	req2 := httptest.NewRequest("GET", "/track/click/test-123?url="+protoURL, nil)
	resp2, _ := app.Test(req2)

	assertEqual(t, http.StatusBadRequest, resp2.StatusCode, "Protocol-relative URL should be rejected")
}

func TestTrackClick_ValidURL(t *testing.T) {
	app := fiber.New()
	handler := &TrackingHandler{}

	app.Get("/track/click/:messageId", handler.TrackClick)

	// Test valid HTTPS URL
	validURL := base64.URLEncoding.EncodeToString([]byte("https://example.com"))
	req := httptest.NewRequest("GET", "/track/click/test-123?url="+validURL, nil)
	resp, _ := app.Test(req)

	// Should not return 400 (will return other status if message not found, but not 400 for invalid URL)
	if resp.StatusCode == http.StatusBadRequest {
		t.Error("Valid URL should not be rejected with 400 Bad Request")
	}
}

