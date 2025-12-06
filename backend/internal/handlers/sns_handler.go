package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"backend/internal/db"
	"backend/internal/models"
	"backend/internal/repositories"
	"backend/internal/services"
	"backend/internal/tracking"
	"backend/internal/types"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/rs/zerolog"
)

type SNSHandler struct {
	snsService     *services.SNSService
	emailRepo      repositories.EmailRepository
	messageTracker *tracking.MessageTracker
	logger         zerolog.Logger
}

// NewSNSHandler creates a new SNS handler
func NewSNSHandler(snsService *services.SNSService, emailRepo repositories.EmailRepository, messageTracker *tracking.MessageTracker) *SNSHandler {
	return &SNSHandler{
		snsService:     snsService,
		emailRepo:      emailRepo,
		messageTracker: messageTracker,
		logger:         zerolog.New(os.Stdout).With().Timestamp().Logger(),
	}
}

// HandleSNSWebhook handles SNS webhook requests (main entry point)
func (h *SNSHandler) HandleSNSWebhook(c *fiber.Ctx) error {
	ctx := c.Context()

	// Get raw body for signature verification
	rawBody := c.Body()

	// Parse SNS message
	var snsMsg types.SNSMessage
	if err := json.Unmarshal(rawBody, &snsMsg); err != nil {
		h.logger.Error().
			Err(err).
			Str("event", "sns.parse.failed").
			Msg("Failed to parse SNS message")
		return c.Status(fiber.StatusBadRequest).SendString("Invalid JSON")
	}

	// Convert to services.SNSMessage for signature verification
	serviceSNSMsg := services.SNSMessage{
		Type:             snsMsg.Type,
		MessageId:        snsMsg.MessageId,
		TopicArn:         snsMsg.TopicArn,
		Subject:          snsMsg.Subject,
		Message:          snsMsg.Message,
		Timestamp:        snsMsg.Timestamp,
		SignatureVersion: snsMsg.SignatureVersion,
		Signature:        snsMsg.Signature,
		SigningCertURL:   snsMsg.SigningCertURL,
		SubscribeURL:     snsMsg.SubscribeURL,
		Token:            snsMsg.Token,
		UnsubscribeURL:   snsMsg.UnsubscribeURL,
	}

	// Verify signature if enabled
	if err := h.snsService.VerifySignature(serviceSNSMsg); err != nil {
		h.logger.Error().
			Err(err).
			Str("event", "sns.verification.failed").
			Str("message_id", snsMsg.MessageId).
			Msg("SNS signature verification failed")
		return c.Status(fiber.StatusForbidden).SendString("Signature verification failed")
	}

	// Handle different message types
	switch snsMsg.Type {
	case "SubscriptionConfirmation":
		return h.processSubscription(ctx, snsMsg)

	case "Notification":
		return h.processNotification(ctx, snsMsg)

	case "UnsubscribeConfirmation":
		h.logger.Info().
			Str("event", "sns.unsubscribe.confirmation").
			Str("message_id", snsMsg.MessageId).
			Str("topic_arn", snsMsg.TopicArn).
			Msg("Received unsubscribe confirmation")
		return c.SendStatus(fiber.StatusOK)

	default:
		h.logger.Warn().
			Str("event", "sns.unknown.type").
			Str("type", snsMsg.Type).
			Str("message_id", snsMsg.MessageId).
			Msg("Unknown SNS message type")
		return c.SendStatus(fiber.StatusOK)
	}
}

// HandleSNS is an alias for backward compatibility
func (h *SNSHandler) HandleSNS(c *fiber.Ctx) error {
	return h.HandleSNSWebhook(c)
}

// processSubscription handles SNS subscription confirmation
func (h *SNSHandler) processSubscription(ctx context.Context, msg types.SNSMessage) error {
	h.logger.Info().
		Str("event", "sns.subscription.confirmation").
		Str("message_id", msg.MessageId).
		Str("topic_arn", msg.TopicArn).
		Msg("Received subscription confirmation")

	if msg.SubscribeURL == "" {
		h.logger.Error().
			Str("event", "sns.subscription.no_url").
			Msg("SubscribeURL is empty")
		return fmt.Errorf("SubscribeURL is empty")
	}

	// Confirm subscription
	if err := h.snsService.ConfirmSubscription(ctx, msg.SubscribeURL); err != nil {
		h.logger.Error().
			Err(err).
			Str("event", "sns.subscription.confirm.failed").
			Str("url", msg.SubscribeURL).
			Msg("Failed to confirm subscription")
		// Still return nil (200 OK) to SNS
	}

	return nil
}

// processNotification handles SNS notification messages containing SES events
func (h *SNSHandler) processNotification(ctx context.Context, msg types.SNSMessage) error {
	// Parse SES event from Message field (double JSON)
	var sesEvent types.SESEventWrapper
	if err := json.Unmarshal([]byte(msg.Message), &sesEvent); err != nil {
		h.logger.Error().
			Err(err).
			Str("event", "sns.notification.parse.failed").
			Str("message_id", msg.MessageId).
			Msg("Failed to parse SES event from SNS message")
		// Return nil to SNS (always return 200 OK)
		return nil
	}

	// Log notification received
	h.logger.Info().
		Str("event", "ses.notification.received").
		Str("notification_type", sesEvent.NotificationType).
		Str("sns_message_id", msg.MessageId).
		Str("ses_message_id", sesEvent.Mail.MessageID).
		Msg("Received SES notification from SNS")

	// Use MessageTracker to process the event
	if h.messageTracker != nil {
		// Pass SNS MessageId for idempotency checking
		if err := h.messageTracker.ProcessSESEventWrapper(ctx, &sesEvent, msg.MessageId); err != nil {
			h.logger.Error().
				Err(err).
				Str("event", "ses.notification.process.failed").
				Str("notification_type", sesEvent.NotificationType).
				Str("sns_message_id", msg.MessageId).
				Msg("Failed to process SES event")
			// Return nil to SNS (always return 200 OK even on processing errors)
			return nil
		}

		// Handle bounce events: update contact status to "bounced"
		if sesEvent.NotificationType == "Bounce" && sesEvent.Bounce != nil {
			// Find email by message ID to get email record
			messageID := h.messageTracker.NormalizeMessageID(sesEvent.Mail)
			email, err := h.emailRepo.GetEmailByMessageID(ctx, messageID)
			if err == nil && email != nil {
				// Update contact status for bounced recipients
				for _, bouncedRecipient := range sesEvent.Bounce.BouncedRecipients {
					emailAddress := strings.ToLower(strings.TrimSpace(bouncedRecipient.EmailAddress))
					if emailAddress == "" {
						continue
					}

					// Find contact by email and update status
					var contact models.Contact
					if err := db.DB.WithContext(ctx).
						Where("LOWER(email) = ?", emailAddress).
						First(&contact).Error; err == nil {
						// Update contact status to bounced
						if err := db.DB.WithContext(ctx).
							Model(&contact).
							Update("status", "bounced").Error; err == nil {
							h.logger.Info().
								Str("event", "ses.bounce.contact_updated").
								Str("contact_id", contact.ID.String()).
								Str("email", emailAddress).
								Msg("Contact status updated to bounced")
						}
					}
				}
			}
		}

		h.logger.Info().
			Str("event", "ses.notification.processed").
			Str("notification_type", sesEvent.NotificationType).
			Str("sns_message_id", msg.MessageId).
			Msg("SES notification processed successfully")
	} else {
		// Fallback to old method if MessageTracker not available
		h.logger.Warn().
			Str("event", "sns.notification.fallback").
			Msg("MessageTracker not available, using fallback method")
		return h.processNotificationFallback(ctx, msg)
	}

	return nil
}

// processNotificationFallback is the old method for backward compatibility
func (h *SNSHandler) processNotificationFallback(ctx context.Context, msg types.SNSMessage) error {
	// Parse SES notification from message body using old service method
	notification, err := h.snsService.ParseSESNotification(msg.Message)
	if err != nil {
		h.logger.Error().
			Err(err).
			Str("event", "sns.notification.parse.failed").
			Str("message_id", msg.MessageId).
			Msg("Failed to parse SES notification")
		return nil
	}

	// Extract message ID
	messageID := h.snsService.ExtractMessageID(notification)

	// Find email by message ID
	email, err := h.emailRepo.GetEmailByMessageID(ctx, messageID)
	if err != nil {
		h.logger.Warn().
			Err(err).
			Str("event", "ses.notification.email_not_found").
			Str("message_id", messageID).
			Msg("Email not found for message ID")
		return nil
	}

	// Build metadata and create event (old method)
	meta := h.snsService.BuildEventMeta(notification)
	eventType := h.snsService.GetEventTypeFromNotificationType(notification.NotificationType)
	newStatus := h.snsService.GetStatusFromNotificationType(notification.NotificationType)

	if newStatus != "" {
		h.emailRepo.UpdateEmailStatus(ctx, email.ID, newStatus)
	}

	metaJSON, _ := json.Marshal(meta)
	event := models.EmailEventRecord{
		ID:        uuid.New(),
		EmailID:   email.ID,
		EventType: eventType,
		Meta:      metaJSON,
		CreatedAt: time.Now(),
	}

	h.emailRepo.AddEmailEvent(ctx, event)
	return nil
}
