package tracking

import (
	"context"
	"fmt"
	"strings"

	"backend/internal/metrics"
	"backend/internal/repositories"
	"backend/internal/types"

	"github.com/rs/zerolog/log"
)

// MessageTracker handles message tracking and event processing
type MessageTracker struct {
	emailRepo repositories.EmailRepository
}

// NewMessageTracker creates a new message tracker
func NewMessageTracker(emailRepo repositories.EmailRepository) *MessageTracker {
	return &MessageTracker{
		emailRepo: emailRepo,
	}
}

// NormalizeMessageID extracts the real RFC Message-ID from SES mail headers
// SES uses TWO types of message IDs:
// - mail.messageId — SES internal ID
// - headers.Message-ID — the real RFC email Message-ID (the one we generated)
// We must always match using headers.Message-ID
func (t *MessageTracker) NormalizeMessageID(mail types.SESMail) string {
	// Look for Message-ID header (case-insensitive)
	for _, h := range mail.Headers {
		if strings.ToLower(h.Name) == "message-id" {
			// Remove angle brackets if present
			msgID := strings.TrimSpace(h.Value)
			msgID = strings.Trim(msgID, "<>")
			return msgID
		}
	}

	// Fallback to SES messageId if no Message-ID header found
	return mail.MessageID
}

// ProcessDeliveryEvent processes a delivery event from SES
func (t *MessageTracker) ProcessDeliveryEvent(ctx context.Context, evt *types.SESDelivery, mail types.SESMail, snsMessageId string) error {
	// Normalize Message-ID
	msgID := t.NormalizeMessageID(mail)

	// Find email by Message-ID
	email, err := t.emailRepo.GetEmailByMessageID(ctx, msgID)
	if err != nil {
		log.Error().
			Err(err).
			Str("message_id", msgID).
			Str("event", "tracking.delivery.email_not_found").
			Msg("Email not found for delivery event")
		return err
	}

	// Check idempotency: if SNS MessageId exists, skip
	if snsMessageId != "" {
		exists, err := t.emailRepo.CheckSNSMessageIdExists(ctx, snsMessageId)
		if err != nil {
			log.Error().
				Err(err).
				Str("sns_message_id", snsMessageId).
				Str("event", "tracking.delivery.idempotency_check_failed").
				Msg("Failed to check SNS message ID")
			// Continue processing even if check fails
		} else if exists {
			log.Info().
				Str("email_id", email.ID.String()).
				Str("sns_message_id", snsMessageId).
				Str("event", "tracking.delivery.duplicate_skipped").
				Str("reason", "duplicate_event_skipped").
				Msg("Event ignored - duplicate SNS message")
			return nil
		}
	}

	// Build metadata
	meta := map[string]interface{}{
		"recipients":             evt.Recipients,
		"smtp_response":          evt.SmtpResponse,
		"reporting_mta":          evt.ReportingMTA,
		"processing_time_millis": evt.ProcessingTimeMillis,
		"timestamp":              evt.Timestamp,
	}

	// Add SNS MessageId to metadata for idempotency
	if snsMessageId != "" {
		meta["sns_message_id"] = snsMessageId
	}

	// Insert event
	if err := t.emailRepo.CreateEmailEventWithMeta(ctx, email.ID, "delivered", meta); err != nil {
		log.Error().
			Err(err).
			Str("email_id", email.ID.String()).
			Str("event", "tracking.delivery.event_insert_failed").
			Msg("Failed to insert delivery event")
		return err
	}

	// Update status
	if err := t.emailRepo.UpdateEmailStatus(ctx, email.ID, "delivered"); err != nil {
		log.Error().
			Err(err).
			Str("email_id", email.ID.String()).
			Str("event", "tracking.delivery.status_update_failed").
			Msg("Failed to update email status")
		return err
	}

	log.Info().
		Str("email_id", email.ID.String()).
		Str("message_id", msgID).
		Str("event", "tracking.delivery.processed").
		Msg("Delivery event processed successfully")

	// Update metrics
	metrics.GetMetrics().IncrementEmailDelivered()

	return nil
}

// ProcessBounceEvent processes a bounce event from SES
func (t *MessageTracker) ProcessBounceEvent(ctx context.Context, evt *types.SESBounce, mail types.SESMail, snsMessageId string) error {
	// Normalize Message-ID
	msgID := t.NormalizeMessageID(mail)

	// Find email by Message-ID
	email, err := t.emailRepo.GetEmailByMessageID(ctx, msgID)
	if err != nil {
		log.Error().
			Err(err).
			Str("message_id", msgID).
			Str("event", "tracking.bounce.email_not_found").
			Msg("Email not found for bounce event")
		return err
	}

	// Check idempotency: if SNS MessageId exists, skip
	if snsMessageId != "" {
		exists, err := t.emailRepo.CheckSNSMessageIdExists(ctx, snsMessageId)
		if err != nil {
			log.Error().
				Err(err).
				Str("sns_message_id", snsMessageId).
				Str("event", "tracking.bounce.idempotency_check_failed").
				Msg("Failed to check SNS message ID")
		} else if exists {
			log.Info().
				Str("email_id", email.ID.String()).
				Str("sns_message_id", snsMessageId).
				Str("event", "tracking.bounce.duplicate_skipped").
				Str("reason", "duplicate_event_skipped").
				Msg("Event ignored - duplicate SNS message")
			return nil
		}
	}

	// Build metadata
	meta := map[string]interface{}{
		"type":          evt.BounceType,
		"sub_type":      evt.BounceSubType,
		"reporting_mta": evt.ReportingMTA,
		"recipients":    evt.BouncedRecipients,
		"feedback_id":   evt.FeedbackID,
		"timestamp":     evt.Timestamp,
	}

	// Add SNS MessageId to metadata for idempotency
	if snsMessageId != "" {
		meta["sns_message_id"] = snsMessageId
	}

	// Insert event
	if err := t.emailRepo.CreateEmailEventWithMeta(ctx, email.ID, "bounce", meta); err != nil {
		log.Error().
			Err(err).
			Str("email_id", email.ID.String()).
			Str("event", "tracking.bounce.event_insert_failed").
			Msg("Failed to insert bounce event")
		return err
	}

	// Update status
	if err := t.emailRepo.UpdateEmailStatus(ctx, email.ID, "bounced"); err != nil {
		log.Error().
			Err(err).
			Str("email_id", email.ID.String()).
			Str("event", "tracking.bounce.status_update_failed").
			Msg("Failed to update email status")
		return err
	}

	log.Info().
		Str("email_id", email.ID.String()).
		Str("message_id", msgID).
		Str("bounce_type", evt.BounceType).
		Str("event", "tracking.bounce.processed").
		Msg("Bounce event processed successfully")

	// Update metrics
	metrics.GetMetrics().IncrementEmailBounced()

	return nil
}

// ProcessComplaintEvent processes a complaint event from SES
func (t *MessageTracker) ProcessComplaintEvent(ctx context.Context, evt *types.SESComplaint, mail types.SESMail, snsMessageId string) error {
	// Normalize Message-ID
	msgID := t.NormalizeMessageID(mail)

	// Find email by Message-ID
	email, err := t.emailRepo.GetEmailByMessageID(ctx, msgID)
	if err != nil {
		log.Error().
			Err(err).
			Str("message_id", msgID).
			Str("event", "tracking.complaint.email_not_found").
			Msg("Email not found for complaint event")
		return err
	}

	// Check idempotency: if SNS MessageId exists, skip
	if snsMessageId != "" {
		exists, err := t.emailRepo.CheckSNSMessageIdExists(ctx, snsMessageId)
		if err != nil {
			log.Error().
				Err(err).
				Str("sns_message_id", snsMessageId).
				Str("event", "tracking.complaint.idempotency_check_failed").
				Msg("Failed to check SNS message ID")
		} else if exists {
			log.Info().
				Str("email_id", email.ID.String()).
				Str("sns_message_id", snsMessageId).
				Str("event", "tracking.complaint.duplicate_skipped").
				Str("reason", "duplicate_event_skipped").
				Msg("Event ignored - duplicate SNS message")
			return nil
		}
	}

	// Build metadata
	meta := map[string]interface{}{
		"complained_recipients":   evt.ComplainedRecipients,
		"feedback_id":             evt.FeedbackId,
		"complaint_feedback_type": evt.ComplaintFeedbackType,
		"user_agent":              evt.UserAgent,
		"arrival_date":            evt.ArrivalDate,
		"timestamp":               evt.Timestamp,
	}

	// Add SNS MessageId to metadata for idempotency
	if snsMessageId != "" {
		meta["sns_message_id"] = snsMessageId
	}

	// Insert event
	if err := t.emailRepo.CreateEmailEventWithMeta(ctx, email.ID, "complaint", meta); err != nil {
		log.Error().
			Err(err).
			Str("email_id", email.ID.String()).
			Str("event", "tracking.complaint.event_insert_failed").
			Msg("Failed to insert complaint event")
		return err
	}

	// Update status
	if err := t.emailRepo.UpdateEmailStatus(ctx, email.ID, "complaint"); err != nil {
		log.Error().
			Err(err).
			Str("email_id", email.ID.String()).
			Str("event", "tracking.complaint.status_update_failed").
			Msg("Failed to update email status")
		return err
	}

	log.Info().
		Str("email_id", email.ID.String()).
		Str("message_id", msgID).
		Str("event", "tracking.complaint.processed").
		Msg("Complaint event processed successfully")

	return nil
}

// ProcessRejectEvent processes a reject event from SES
func (t *MessageTracker) ProcessRejectEvent(ctx context.Context, evt *types.SESReject, mail types.SESMail, snsMessageId string) error {
	// Normalize Message-ID
	msgID := t.NormalizeMessageID(mail)

	// Find email by Message-ID
	email, err := t.emailRepo.GetEmailByMessageID(ctx, msgID)
	if err != nil {
		log.Error().
			Err(err).
			Str("message_id", msgID).
			Str("event", "tracking.reject.email_not_found").
			Msg("Email not found for reject event")
		return err
	}

	// Check idempotency: if SNS MessageId exists, skip
	if snsMessageId != "" {
		exists, err := t.emailRepo.CheckSNSMessageIdExists(ctx, snsMessageId)
		if err != nil {
			log.Error().
				Err(err).
				Str("sns_message_id", snsMessageId).
				Str("event", "tracking.reject.idempotency_check_failed").
				Msg("Failed to check SNS message ID")
		} else if exists {
			log.Info().
				Str("email_id", email.ID.String()).
				Str("sns_message_id", snsMessageId).
				Str("event", "tracking.reject.duplicate_skipped").
				Str("reason", "duplicate_event_skipped").
				Msg("Event ignored - duplicate SNS message")
			return nil
		}
	}

	// Build metadata
	meta := map[string]interface{}{
		"reason":     evt.Reason,
		"recipients": evt.Recipients,
		"timestamp":  evt.Timestamp,
	}

	// Add SNS MessageId to metadata for idempotency
	if snsMessageId != "" {
		meta["sns_message_id"] = snsMessageId
	}

	// Insert event
	if err := t.emailRepo.CreateEmailEventWithMeta(ctx, email.ID, "reject", meta); err != nil {
		log.Error().
			Err(err).
			Str("email_id", email.ID.String()).
			Str("event", "tracking.reject.event_insert_failed").
			Msg("Failed to insert reject event")
		return err
	}

	// Update status
	if err := t.emailRepo.UpdateEmailStatus(ctx, email.ID, "rejected"); err != nil {
		log.Error().
			Err(err).
			Str("email_id", email.ID.String()).
			Str("event", "tracking.reject.status_update_failed").
			Msg("Failed to update email status")
		return err
	}

	log.Info().
		Str("email_id", email.ID.String()).
		Str("message_id", msgID).
		Str("event", "tracking.reject.processed").
		Msg("Reject event processed successfully")

	return nil
}

// ProcessRenderingFailureEvent processes a rendering failure event from SES
func (t *MessageTracker) ProcessRenderingFailureEvent(ctx context.Context, evt *types.SESRenderingFailure, mail types.SESMail, snsMessageId string) error {
	// Normalize Message-ID
	msgID := t.NormalizeMessageID(mail)

	// Find email by Message-ID
	email, err := t.emailRepo.GetEmailByMessageID(ctx, msgID)
	if err != nil {
		log.Error().
			Err(err).
			Str("message_id", msgID).
			Str("event", "tracking.rendering_failure.email_not_found").
			Msg("Email not found for rendering failure event")
		return err
	}

	// Check idempotency: if SNS MessageId exists, skip
	if snsMessageId != "" {
		exists, err := t.emailRepo.CheckSNSMessageIdExists(ctx, snsMessageId)
		if err != nil {
			log.Error().
				Err(err).
				Str("sns_message_id", snsMessageId).
				Str("event", "tracking.rendering_failure.idempotency_check_failed").
				Msg("Failed to check SNS message ID")
		} else if exists {
			log.Info().
				Str("email_id", email.ID.String()).
				Str("sns_message_id", snsMessageId).
				Str("event", "tracking.rendering_failure.duplicate_skipped").
				Str("reason", "duplicate_event_skipped").
				Msg("Event ignored - duplicate SNS message")
			return nil
		}
	}

	// Build metadata
	meta := map[string]interface{}{
		"error_message": evt.ErrorMessage,
		"template_name": evt.TemplateName,
		"timestamp":     evt.Timestamp,
	}

	// Add SNS MessageId to metadata for idempotency
	if snsMessageId != "" {
		meta["sns_message_id"] = snsMessageId
	}

	// Insert event
	if err := t.emailRepo.CreateEmailEventWithMeta(ctx, email.ID, "rendering_failure", meta); err != nil {
		log.Error().
			Err(err).
			Str("email_id", email.ID.String()).
			Str("event", "tracking.rendering_failure.event_insert_failed").
			Msg("Failed to insert rendering failure event")
		return err
	}

	// Update status
	if err := t.emailRepo.UpdateEmailStatus(ctx, email.ID, "rendering_failed"); err != nil {
		log.Error().
			Err(err).
			Str("email_id", email.ID.String()).
			Str("event", "tracking.rendering_failure.status_update_failed").
			Msg("Failed to update email status")
		return err
	}

	log.Info().
		Str("email_id", email.ID.String()).
		Str("message_id", msgID).
		Str("event", "tracking.rendering_failure.processed").
		Msg("Rendering failure event processed successfully")

	return nil
}

// ProcessOpenEvent processes an open event (from tracking pixel)
func (t *MessageTracker) ProcessOpenEvent(ctx context.Context, messageID string) error {
	// Normalize messageID (remove angle brackets if present)
	normalized := strings.Trim(messageID, "<>")

	// Find email by Message-ID
	email, err := t.emailRepo.GetEmailByMessageID(ctx, normalized)
	if err != nil {
		log.Error().
			Err(err).
			Str("message_id", normalized).
			Str("event", "tracking.open.email_not_found").
			Msg("Email not found for open event")
		return err
	}

	// Check idempotency: only one open per day per email
	exists, err := t.emailRepo.CheckOpenEventExistsToday(ctx, email.ID)
	if err != nil {
		log.Error().
			Err(err).
			Str("email_id", email.ID.String()).
			Str("event", "tracking.open.idempotency_check_failed").
			Msg("Failed to check open event")
		// Continue processing even if check fails
	} else if exists {
		log.Info().
			Str("email_id", email.ID.String()).
			Str("message_id", normalized).
			Str("event", "tracking.open.duplicate_skipped").
			Str("reason", "duplicate_event_skipped").
			Msg("Event ignored - open already recorded today")
		return nil
	}

	// Build metadata (can be extended with IP, User-Agent, etc.)
	meta := map[string]interface{}{
		"tracked_at": "now", // Can be extended with timestamp
	}

	// Insert event
	if err := t.emailRepo.CreateEmailEventWithMeta(ctx, email.ID, "open", meta); err != nil {
		log.Error().
			Err(err).
			Str("email_id", email.ID.String()).
			Str("event", "tracking.open.event_insert_failed").
			Msg("Failed to insert open event")
		return err
	}

	log.Info().
		Str("email_id", email.ID.String()).
		Str("message_id", normalized).
		Str("event", "tracking.open.processed").
		Msg("Open event processed successfully")

	// Update metrics
	metrics.GetMetrics().IncrementOpenTracked()

	return nil
}

// ProcessClickEvent processes a click event (from click tracking redirect)
func (t *MessageTracker) ProcessClickEvent(ctx context.Context, messageID, url string) error {
	// Normalize messageID (remove angle brackets if present)
	normalized := strings.Trim(messageID, "<>")

	// Find email by Message-ID
	email, err := t.emailRepo.GetEmailByMessageID(ctx, normalized)
	if err != nil {
		log.Error().
			Err(err).
			Str("message_id", normalized).
			Str("event", "tracking.click.email_not_found").
			Msg("Email not found for click event")
		return err
	}

	// Check idempotency: only one click per email per URL
	exists, err := t.emailRepo.CheckClickEventExists(ctx, email.ID, url)
	if err != nil {
		log.Error().
			Err(err).
			Str("email_id", email.ID.String()).
			Str("event", "tracking.click.idempotency_check_failed").
			Msg("Failed to check click event")
		// Continue processing even if check fails
	} else if exists {
		log.Info().
			Str("email_id", email.ID.String()).
			Str("message_id", normalized).
			Str("url", url).
			Str("event", "tracking.click.duplicate_skipped").
			Str("reason", "duplicate_event_skipped").
			Msg("Event ignored - click already recorded for this URL")
		return nil
	}

	// Build metadata
	meta := map[string]interface{}{
		"url":        url,
		"tracked_at": "now", // Can be extended with timestamp
	}

	// Insert event
	if err := t.emailRepo.CreateEmailEventWithMeta(ctx, email.ID, "click", meta); err != nil {
		log.Error().
			Err(err).
			Str("email_id", email.ID.String()).
			Str("event", "tracking.click.event_insert_failed").
			Msg("Failed to insert click event")
		return err
	}

	log.Info().
		Str("email_id", email.ID.String()).
		Str("message_id", normalized).
		Str("url", url).
		Str("event", "tracking.click.processed").
		Msg("Click event processed successfully")

	// Update metrics
	metrics.GetMetrics().IncrementClickTracked()

	return nil
}

// ProcessSESEventWrapper processes a complete SES event wrapper from SNS
// This is the central method for handling all SES event types
// snsMessageId is used for idempotency checking
func (t *MessageTracker) ProcessSESEventWrapper(ctx context.Context, eventWrapper *types.SESEventWrapper, snsMessageId string) error {
	// Normalize Message-ID from mail headers
	msgID := t.NormalizeMessageID(eventWrapper.Mail)

	// Route to appropriate handler based on notification type
	switch eventWrapper.NotificationType {
	case "Delivery":
		if eventWrapper.Delivery != nil {
			return t.ProcessDeliveryEvent(ctx, eventWrapper.Delivery, eventWrapper.Mail, snsMessageId)
		}
		log.Warn().
			Str("message_id", msgID).
			Str("event", "tracking.ses.delivery.missing_data").
			Msg("Delivery notification received but delivery data is missing")
		return fmt.Errorf("delivery notification missing delivery data")

	case "Bounce":
		if eventWrapper.Bounce != nil {
			return t.ProcessBounceEvent(ctx, eventWrapper.Bounce, eventWrapper.Mail, snsMessageId)
		}
		log.Warn().
			Str("message_id", msgID).
			Str("event", "tracking.ses.bounce.missing_data").
			Msg("Bounce notification received but bounce data is missing")
		return fmt.Errorf("bounce notification missing bounce data")

	case "Complaint":
		if eventWrapper.Complaint != nil {
			return t.ProcessComplaintEvent(ctx, eventWrapper.Complaint, eventWrapper.Mail, snsMessageId)
		}
		log.Warn().
			Str("message_id", msgID).
			Str("event", "tracking.ses.complaint.missing_data").
			Msg("Complaint notification received but complaint data is missing")
		return fmt.Errorf("complaint notification missing complaint data")

	case "Reject":
		if eventWrapper.Reject != nil {
			return t.ProcessRejectEvent(ctx, eventWrapper.Reject, eventWrapper.Mail, snsMessageId)
		}
		log.Warn().
			Str("message_id", msgID).
			Str("event", "tracking.ses.reject.missing_data").
			Msg("Reject notification received but reject data is missing")
		return fmt.Errorf("reject notification missing reject data")

	case "RenderingFailure":
		if eventWrapper.RenderingFailure != nil {
			return t.ProcessRenderingFailureEvent(ctx, eventWrapper.RenderingFailure, eventWrapper.Mail, snsMessageId)
		}
		log.Warn().
			Str("message_id", msgID).
			Str("event", "tracking.ses.rendering_failure.missing_data").
			Msg("Rendering failure notification received but rendering failure data is missing")
		return fmt.Errorf("rendering failure notification missing data")

	default:
		log.Warn().
			Str("message_id", msgID).
			Str("notification_type", eventWrapper.NotificationType).
			Str("event", "tracking.ses.unknown_type").
			Msg("Unknown SES notification type")
		return fmt.Errorf("unknown notification type: %s", eventWrapper.NotificationType)
	}
}
