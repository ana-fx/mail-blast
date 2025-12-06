package services

import (
	"context"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"os"

	"github.com/rs/zerolog"
)

// SNSMessage represents the SNS message structure
type SNSMessage struct {
	Type             string `json:"Type"`
	MessageId        string `json:"MessageId"`
	TopicArn         string `json:"TopicArn"`
	Subject          string `json:"Subject"`
	Message          string `json:"Message"`
	Timestamp        string `json:"Timestamp"`
	SignatureVersion string `json:"SignatureVersion"`
	Signature        string `json:"Signature"`
	SigningCertURL   string `json:"SigningCertURL"`
	SubscribeURL     string `json:"SubscribeURL"`
	Token            string `json:"Token"`
	UnsubscribeURL   string `json:"UnsubscribeURL"`
}

// SESNotification represents SES event notification
type SESNotification struct {
	NotificationType string                 `json:"notificationType"`
	Mail             SESMail                `json:"mail"`
	Bounce           *SESBounce             `json:"bounce,omitempty"`
	Delivery         *SESDelivery           `json:"delivery,omitempty"`
	Complaint        *SESComplaint          `json:"complaint,omitempty"`
	Receipt          map[string]interface{} `json:"receipt,omitempty"`
}

// SESMail represents mail information in SES notification
type SESMail struct {
	MessageId     string                 `json:"messageId"`
	Timestamp     string                 `json:"timestamp"`
	Source        string                 `json:"source"`
	Destination   []string               `json:"destination"`
	Headers       []SESHeader            `json:"headers"`
	CommonHeaders map[string]interface{} `json:"commonHeaders"`
}

// SESHeader represents email header
type SESHeader struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

// SESBounce represents bounce information
type SESBounce struct {
	BounceType        string                `json:"bounceType"`
	BounceSubType     string                `json:"bounceSubType"`
	BouncedRecipients []SESBouncedRecipient `json:"bouncedRecipients"`
	Timestamp         string                `json:"timestamp"`
	FeedbackId        string                `json:"feedbackId"`
	ReportingMTA      string                `json:"reportingMTA"`
}

// SESBouncedRecipient represents bounced recipient
type SESBouncedRecipient struct {
	EmailAddress   string `json:"emailAddress"`
	Action         string `json:"action"`
	Status         string `json:"status"`
	DiagnosticCode string `json:"diagnosticCode"`
}

// SESDelivery represents delivery information
type SESDelivery struct {
	Timestamp            string   `json:"timestamp"`
	ProcessingTimeMillis int      `json:"processingTimeMillis"`
	Recipients           []string `json:"recipients"`
	SmtpResponse         string   `json:"smtpResponse"`
	ReportingMTA         string   `json:"reportingMTA"`
}

// SESComplaint represents complaint information
type SESComplaint struct {
	ComplainedRecipients  []SESComplainedRecipient `json:"complainedRecipients"`
	Timestamp             string                   `json:"timestamp"`
	FeedbackId            string                   `json:"feedbackId"`
	ComplaintFeedbackType string                   `json:"complaintFeedbackType"`
	UserAgent             string                   `json:"userAgent"`
	ArrivalDate           string                   `json:"arrivalDate"`
}

// SESComplainedRecipient represents complained recipient
type SESComplainedRecipient struct {
	EmailAddress string `json:"emailAddress"`
}

type SNSService struct {
	verifySignature bool
	logger          zerolog.Logger
	httpClient      *http.Client
}

// NewSNSService creates a new SNS service
func NewSNSService(verifySignature bool) *SNSService {
	return &SNSService{
		verifySignature: verifySignature,
		logger:          zerolog.New(os.Stdout).With().Timestamp().Logger(),
		httpClient:      &http.Client{Timeout: 10 * time.Second},
	}
}

// ConfirmSubscription confirms SNS subscription by calling SubscribeURL
func (s *SNSService) ConfirmSubscription(ctx context.Context, subscribeURL string) error {
	s.logger.Info().
		Str("event", "sns.subscription.confirm").
		Str("url", subscribeURL).
		Msg("Confirming SNS subscription")

	req, err := http.NewRequestWithContext(ctx, "GET", subscribeURL, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to confirm subscription: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("subscription confirmation failed: status %d, body: %s", resp.StatusCode, string(body))
	}

	s.logger.Info().
		Str("event", "sns.subscription.confirmed").
		Str("url", subscribeURL).
		Msg("SNS subscription confirmed successfully")

	return nil
}

// VerifySignature verifies SNS message signature
func (s *SNSService) VerifySignature(msg SNSMessage) error {
	if !s.verifySignature {
		return nil // Skip verification
	}

	// Download certificate from SigningCertURL
	cert, err := s.downloadCertificate(msg.SigningCertURL)
	if err != nil {
		return fmt.Errorf("failed to download certificate: %w", err)
	}

	// Build string to sign
	stringToSign := s.buildStringToSign(msg)

	// Decode signature
	signature, err := base64.StdEncoding.DecodeString(msg.Signature)
	if err != nil {
		return fmt.Errorf("failed to decode signature: %w", err)
	}

	// Verify signature
	err = cert.CheckSignature(x509.SHA1WithRSA, []byte(stringToSign), signature)
	if err != nil {
		return fmt.Errorf("signature verification failed: %w", err)
	}

	return nil
}

// downloadCertificate downloads and parses certificate from URL
func (s *SNSService) downloadCertificate(url string) (*x509.Certificate, error) {
	resp, err := s.httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to download certificate: %w", err)
	}
	defer resp.Body.Close()

	certPEM, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read certificate: %w", err)
	}

	block, _ := pem.Decode(certPEM)
	if block == nil {
		return nil, fmt.Errorf("failed to decode PEM block")
	}

	cert, err := x509.ParseCertificate(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("failed to parse certificate: %w", err)
	}

	return cert, nil
}

// buildStringToSign builds the string to sign for SNS verification
func (s *SNSService) buildStringToSign(msg SNSMessage) string {
	var buf strings.Builder

	buf.WriteString("Message\n")
	buf.WriteString(msg.Message)
	buf.WriteString("\n")

	buf.WriteString("MessageId\n")
	buf.WriteString(msg.MessageId)
	buf.WriteString("\n")

	if msg.Subject != "" {
		buf.WriteString("Subject\n")
		buf.WriteString(msg.Subject)
		buf.WriteString("\n")
	}

	buf.WriteString("Timestamp\n")
	buf.WriteString(msg.Timestamp)
	buf.WriteString("\n")

	buf.WriteString("TopicArn\n")
	buf.WriteString(msg.TopicArn)
	buf.WriteString("\n")

	buf.WriteString("Type\n")
	buf.WriteString(msg.Type)
	buf.WriteString("\n")

	return buf.String()
}

// ParseSESNotification parses SES notification from SNS message
func (s *SNSService) ParseSESNotification(messageBody string) (*SESNotification, error) {
	var notification SESNotification
	if err := json.Unmarshal([]byte(messageBody), &notification); err != nil {
		return nil, fmt.Errorf("failed to parse SES notification: %w", err)
	}
	return &notification, nil
}

// ExtractMessageID extracts message ID from SES notification
func (s *SNSService) ExtractMessageID(notification *SESNotification) string {
	// Try to find our Message-ID from headers
	for _, header := range notification.Mail.Headers {
		if strings.ToLower(header.Name) == "message-id" {
			// Remove angle brackets
			msgID := strings.Trim(header.Value, "<>")
			return msgID
		}
	}

	// Fallback to SES messageId
	return notification.Mail.MessageId
}

// BuildEventMeta builds metadata object from SES notification
func (s *SNSService) BuildEventMeta(notification *SESNotification) map[string]interface{} {
	meta := make(map[string]interface{})

	meta["ses_message_id"] = notification.Mail.MessageId
	meta["timestamp"] = notification.Mail.Timestamp
	meta["source"] = notification.Mail.Source
	meta["destination"] = notification.Mail.Destination

	switch notification.NotificationType {
	case "Bounce":
		if notification.Bounce != nil {
			meta["bounce_type"] = notification.Bounce.BounceType
			meta["bounce_sub_type"] = notification.Bounce.BounceSubType
			meta["bounced_recipients"] = notification.Bounce.BouncedRecipients
			meta["feedback_id"] = notification.Bounce.FeedbackId
			meta["reporting_mta"] = notification.Bounce.ReportingMTA
		}
	case "Delivery":
		if notification.Delivery != nil {
			meta["processing_time_millis"] = notification.Delivery.ProcessingTimeMillis
			meta["recipients"] = notification.Delivery.Recipients
			meta["smtp_response"] = notification.Delivery.SmtpResponse
			meta["reporting_mta"] = notification.Delivery.ReportingMTA
		}
	case "Complaint":
		if notification.Complaint != nil {
			meta["complained_recipients"] = notification.Complaint.ComplainedRecipients
			meta["feedback_id"] = notification.Complaint.FeedbackId
			meta["complaint_feedback_type"] = notification.Complaint.ComplaintFeedbackType
			meta["user_agent"] = notification.Complaint.UserAgent
			meta["arrival_date"] = notification.Complaint.ArrivalDate
		}
	}

	return meta
}

// GetStatusFromNotificationType maps notification type to email status
func (s *SNSService) GetStatusFromNotificationType(notificationType string) string {
	switch notificationType {
	case "Delivery":
		return "delivered" // Changed from "sent" to "delivered" for delivery notifications
	case "Bounce":
		return "bounced"
	case "Complaint":
		return "complaint"
	default:
		return ""
	}
}

// GetEventTypeFromNotificationType maps notification type to event type
func (s *SNSService) GetEventTypeFromNotificationType(notificationType string) string {
	switch notificationType {
	case "Delivery":
		return "delivered"
	case "Bounce":
		return "bounce"
	case "Complaint":
		return "complaint"
	default:
		return notificationType
	}
}
