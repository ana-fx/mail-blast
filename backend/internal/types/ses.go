package types

// SESNotification represents SES event notification from SNS
type SESNotification struct {
	Type      string `json:"Type"`
	MessageId string `json:"MessageId"`
	TopicArn  string `json:"TopicArn"`
	Timestamp string `json:"Timestamp"`
	Message   string `json:"Message"`
}

// SESEventWrapper represents the parsed SES event from Message field
type SESEventWrapper struct {
	NotificationType string               `json:"notificationType"`
	Mail             SESMail              `json:"mail"`
	Delivery         *SESDelivery         `json:"delivery,omitempty"`
	Bounce           *SESBounce           `json:"bounce,omitempty"`
	Complaint        *SESComplaint        `json:"complaint,omitempty"`
	Reject           *SESReject           `json:"reject,omitempty"`
	RenderingFailure *SESRenderingFailure `json:"renderingFailure,omitempty"`
}

// SESMail represents mail information in SES notification
type SESMail struct {
	MessageID   string      `json:"messageId"`
	Timestamp   string      `json:"timestamp"`
	Source      string      `json:"source"`
	Destination []string    `json:"destination"`
	Headers     []SESHeader `json:"headers"`
}

// SESHeader represents email header
type SESHeader struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

// SESDelivery represents delivery information
type SESDelivery struct {
	Timestamp            string   `json:"timestamp"`
	ProcessingTimeMillis int      `json:"processingTimeMillis"`
	Recipients           []string `json:"recipients"`
	ReportingMTA         string   `json:"reportingMTA"`
	SmtpResponse         string   `json:"smtpResponse"`
}

// SESBounce represents bounce information
type SESBounce struct {
	BounceType        string                `json:"bounceType"`
	BounceSubType     string                `json:"bounceSubType"`
	Timestamp         string                `json:"timestamp"`
	BouncedRecipients []SESBouncedRecipient `json:"bouncedRecipients"`
	ReportingMTA      string                `json:"reportingMTA"`
	FeedbackID        string                `json:"feedbackId"`
}

// SESBouncedRecipient represents bounced recipient
type SESBouncedRecipient struct {
	EmailAddress   string `json:"emailAddress"`
	Action         string `json:"action"`
	Status         string `json:"status"`
	DiagnosticCode string `json:"diagnosticCode"`
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

// SESReject represents rejection information
type SESReject struct {
	Reason     string   `json:"reason"`
	Recipients []string `json:"recipients"`
	Timestamp  string   `json:"timestamp"`
}

// SESRenderingFailure represents rendering failure information
type SESRenderingFailure struct {
	ErrorMessage string `json:"errorMessage"`
	TemplateName string `json:"templateName"`
	Timestamp    string `json:"timestamp"`
}
