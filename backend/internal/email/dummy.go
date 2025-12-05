package email

import (
	"log"
)

// DummyMailer is a fake email sender for testing/development
type DummyMailer struct{}

// NewDummyMailer creates a new dummy mailer instance
func NewDummyMailer() *DummyMailer {
	return &DummyMailer{}
}

// SendEmail logs email details without actually sending
func (d *DummyMailer) SendEmail(to, subject, htmlBody, from string) error {
	log.Printf("[DUMMY EMAIL] To: %s | Subject: %s | From: %s", to, subject, from)
	return nil
}
