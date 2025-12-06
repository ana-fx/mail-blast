package email

import (
	"strings"
	"testing"
)

func TestBuildMIMEEmail_TextOnly(t *testing.T) {
	sender := &SmtpEmailSender{
		host:     "test.example.com",
		port:     587,
		username: "test",
		password: "test",
	}

	msg := EmailMessage{
		From:     "sender@example.com",
		To:       "recipient@example.com",
		Subject:  "Test Subject",
		TextBody: "This is a test email body.",
		Headers:  make(map[string]string),
	}

	emailBody, err := sender.buildMIMEEmail(msg)
	if err != nil {
		t.Fatalf("Failed to build MIME email: %v", err)
	}

	bodyStr := string(emailBody)

	// Check required headers
	if !strings.Contains(bodyStr, "From: sender@example.com") {
		t.Error("Missing From header")
	}
	if !strings.Contains(bodyStr, "To: recipient@example.com") {
		t.Error("Missing To header")
	}
	if !strings.Contains(bodyStr, "Subject: Test Subject") {
		t.Error("Missing Subject header")
	}
	if !strings.Contains(bodyStr, "MIME-Version: 1.0") {
		t.Error("Missing MIME-Version header")
	}

	// Check content type for text
	if !strings.Contains(bodyStr, "Content-Type: text/plain; charset=UTF-8") {
		t.Error("Missing or incorrect Content-Type for text")
	}

	// Check body content
	if !strings.Contains(bodyStr, "This is a test email body.") {
		t.Error("Email body not found in MIME message")
	}
}

func TestBuildMIMEEmail_HTMLOnly(t *testing.T) {
	sender := &SmtpEmailSender{
		host:     "test.example.com",
		port:     587,
		username: "test",
		password: "test",
	}

	msg := EmailMessage{
		From:     "sender@example.com",
		To:       "recipient@example.com",
		Subject:  "Test HTML Email",
		HTMLBody: "<h1>Hello</h1><p>This is HTML content.</p>",
		Headers:  make(map[string]string),
	}

	emailBody, err := sender.buildMIMEEmail(msg)
	if err != nil {
		t.Fatalf("Failed to build MIME email: %v", err)
	}

	bodyStr := string(emailBody)

	// Check content type for HTML
	if !strings.Contains(bodyStr, "Content-Type: text/html; charset=UTF-8") {
		t.Error("Missing or incorrect Content-Type for HTML")
	}

	// Check HTML body content
	if !strings.Contains(bodyStr, "<h1>Hello</h1>") {
		t.Error("HTML body not found in MIME message")
	}
}

func TestBuildMIMEEmail_Multipart(t *testing.T) {
	sender := &SmtpEmailSender{
		host:     "test.example.com",
		port:     587,
		username: "test",
		password: "test",
	}

	msg := EmailMessage{
		From:     "sender@example.com",
		To:       "recipient@example.com",
		Subject:  "Multipart Email",
		TextBody: "Plain text version",
		HTMLBody: "<p>HTML version</p>",
		Headers:  make(map[string]string),
	}

	emailBody, err := sender.buildMIMEEmail(msg)
	if err != nil {
		t.Fatalf("Failed to build MIME email: %v", err)
	}

	bodyStr := string(emailBody)

	// Check multipart content type
	if !strings.Contains(bodyStr, "Content-Type: multipart/alternative") {
		t.Error("Missing multipart/alternative Content-Type")
	}

	// Check for boundary
	if !strings.Contains(bodyStr, "boundary=") {
		t.Error("Missing boundary in multipart message")
	}

	// Check text part
	if !strings.Contains(bodyStr, "Content-Type: text/plain") {
		t.Error("Missing text/plain part")
	}
	if !strings.Contains(bodyStr, "Plain text version") {
		t.Error("Text body not found")
	}

	// Check HTML part
	if !strings.Contains(bodyStr, "Content-Type: text/html") {
		t.Error("Missing text/html part")
	}
	if !strings.Contains(bodyStr, "<p>HTML version</p>") {
		t.Error("HTML body not found")
	}
}

func TestBuildMIMEEmail_CustomHeaders(t *testing.T) {
	sender := &SmtpEmailSender{
		host:     "test.example.com",
		port:     587,
		username: "test",
		password: "test",
	}

	msg := EmailMessage{
		From:     "sender@example.com",
		To:       "recipient@example.com",
		Subject:  "Test Headers",
		TextBody: "Test body",
		Headers: map[string]string{
			"X-Custom-Header": "custom-value",
			"X-Priority":      "1",
			"Message-ID":      "<custom-id@example.com>",
		},
	}

	emailBody, err := sender.buildMIMEEmail(msg)
	if err != nil {
		t.Fatalf("Failed to build MIME email: %v", err)
	}

	bodyStr := string(emailBody)

	// Check custom headers
	if !strings.Contains(bodyStr, "X-Custom-Header: custom-value") {
		t.Error("Custom header X-Custom-Header not found")
	}
	if !strings.Contains(bodyStr, "X-Priority: 1") {
		t.Error("Custom header X-Priority not found")
	}

	// Check Message-ID
	if !strings.Contains(bodyStr, "Message-ID: <custom-id@example.com>") {
		t.Error("Custom Message-ID not found")
	}
}

func TestBuildMIMEEmail_SubjectEncoding(t *testing.T) {
	sender := &SmtpEmailSender{
		host:     "test.example.com",
		port:     587,
		username: "test",
		password: "test",
	}

	testCases := []struct {
		name    string
		subject string
	}{
		{"ASCII Subject", "Simple Test Subject"},
		{"Subject with Special Chars", "Test: Subject with Special Characters!"},
		{"Subject with Numbers", "Test 123 Subject"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			msg := EmailMessage{
				From:     "sender@example.com",
				To:       "recipient@example.com",
				Subject:  tc.subject,
				TextBody: "Test body",
				Headers:  make(map[string]string),
			}

			emailBody, err := sender.buildMIMEEmail(msg)
			if err != nil {
				t.Fatalf("Failed to build MIME email: %v", err)
			}

			bodyStr := string(emailBody)
			expectedHeader := "Subject: " + tc.subject

			if !strings.Contains(bodyStr, expectedHeader) {
				t.Errorf("Subject header not found or incorrect. Expected: %s", expectedHeader)
			}
		})
	}
}

func TestBuildMIMEEmail_MIMEStructure(t *testing.T) {
	sender := &SmtpEmailSender{
		host:     "test.example.com",
		port:     587,
		username: "test",
		password: "test",
	}

	msg := EmailMessage{
		From:     "sender@example.com",
		To:       "recipient@example.com",
		Subject:  "MIME Structure Test",
		TextBody: "Text content",
		HTMLBody: "<p>HTML content</p>",
		Headers:  make(map[string]string),
	}

	emailBody, err := sender.buildMIMEEmail(msg)
	if err != nil {
		t.Fatalf("Failed to build MIME email: %v", err)
	}

	bodyStr := string(emailBody)

	// Check MIME structure
	// Should have headers section
	if !strings.Contains(bodyStr, "From:") {
		t.Error("MIME structure missing headers section")
	}

	// Should have blank line separating headers and body
	headerBodySplit := strings.Split(bodyStr, "\r\n\r\n")
	if len(headerBodySplit) < 2 {
		t.Error("MIME structure missing header/body separator")
	}

	// Check Content-Transfer-Encoding
	if !strings.Contains(bodyStr, "Content-Transfer-Encoding: quoted-printable") {
		t.Error("Missing Content-Transfer-Encoding header")
	}

	// Check boundary closure for multipart
	if strings.Contains(bodyStr, "multart/alternative") {
		// Should end with boundary closure
		if !strings.Contains(bodyStr, "--") {
			t.Error("Multipart message missing boundary closure")
		}
	}
}

func TestQuotedPrintableEncode(t *testing.T) {
	sender := &SmtpEmailSender{}

	testCases := []struct {
		name     string
		input    string
		expected string // Should contain certain patterns
	}{
		{"Simple text", "Hello World", "Hello World"},
		{"Text with newline", "Line 1\nLine 2", "Line 1"},
		{"Text with equals", "Test=Value", "="}, // Should encode =
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result := sender.quotedPrintableEncode(tc.input)
			if result == "" {
				t.Error("Quoted-printable encoding returned empty string")
			}
			// Basic validation - result should not be empty
			if len(result) == 0 {
				t.Error("Encoding result is empty")
			}
		})
	}
}

func TestGenerateMessageID(t *testing.T) {
	sender := &SmtpEmailSender{}

	msgID := sender.generateMessageID("test@example.com")

	// Check format: <timestamp.nanotime@domain>
	if !strings.HasPrefix(msgID, "<") {
		t.Error("Message-ID should start with <")
	}
	if !strings.HasSuffix(msgID, ">") {
		t.Error("Message-ID should end with >")
	}
	if !strings.Contains(msgID, "@example.com>") {
		t.Error("Message-ID should contain domain from email address")
	}
}
