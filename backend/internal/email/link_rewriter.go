package email

import (
	"encoding/base64"
	"fmt"
	"regexp"
	"strings"
)

var (
	// Regex to match href attributes in anchor tags
	hrefRegex = regexp.MustCompile(`(?i)<a\s+([^>]*\s+)?href=["']([^"']+)["']([^>]*)>([^<]*)</a>`)
)

// RewriteLinks rewrites all links in HTML to use click tracking
func RewriteLinks(htmlBody, messageID, trackingDomain string) string {
	if htmlBody == "" || messageID == "" {
		return htmlBody
	}

	// Remove angle brackets from messageID if present
	cleanMessageID := strings.Trim(messageID, "<>")

	// Find all href links and replace them
	rewritten := hrefRegex.ReplaceAllStringFunc(htmlBody, func(match string) string {
		// Extract href URL
		hrefMatch := regexp.MustCompile(`(?i)href=["']([^"']+)["']`).FindStringSubmatch(match)
		if len(hrefMatch) < 2 {
			return match // Return original if no href found
		}

		originalURL := hrefMatch[1]

		// Skip if already a tracking URL or mailto/tel links
		if strings.Contains(originalURL, "/track/click/") ||
			strings.HasPrefix(originalURL, "mailto:") ||
			strings.HasPrefix(originalURL, "tel:") ||
			strings.HasPrefix(originalURL, "#") {
			return match
		}

		// Encode URL using base64 URL encoding
		encodedURL := base64.URLEncoding.EncodeToString([]byte(originalURL))

		// Build tracking URL with base64 encoded destination
		trackingURL := fmt.Sprintf("%s/track/click/%s?url=%s",
			strings.TrimSuffix(trackingDomain, "/"),
			cleanMessageID,
			encodedURL)

		// Replace href in the match
		newMatch := regexp.MustCompile(`(?i)href=["'][^"']+["']`).ReplaceAllString(match, fmt.Sprintf(`href="%s"`, trackingURL))
		return newMatch
	})

	return rewritten
}
