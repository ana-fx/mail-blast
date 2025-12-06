package types

// SNSMessage represents the SNS message structure from AWS
type SNSMessage struct {
	Type             string `json:"Type"`
	MessageId        string `json:"MessageId"`
	TopicArn         string `json:"TopicArn"`
	Subject          string `json:"Subject,omitempty"`
	Message          string `json:"Message"`
	Timestamp        string `json:"Timestamp"`
	SignatureVersion string `json:"SignatureVersion"`
	Signature        string `json:"Signature"`
	SigningCertURL   string `json:"SigningCertURL"`
	SubscribeURL     string `json:"SubscribeURL,omitempty"`
	Token            string `json:"Token,omitempty"`
	UnsubscribeURL   string `json:"UnsubscribeURL,omitempty"`
}

// SNSNotificationMessage represents the inner message structure for notifications
type SNSNotificationMessage struct {
	Type             string `json:"Type"`
	MessageId        string `json:"MessageId"`
	TopicArn         string `json:"TopicArn"`
	Subject          string `json:"Subject,omitempty"`
	Message          string `json:"Message"`
	Timestamp        string `json:"Timestamp"`
	SignatureVersion string `json:"SignatureVersion"`
	Signature        string `json:"Signature"`
	SigningCertURL   string `json:"SigningCertURL"`
}

// SESMessageNotification represents the SES event notification inside SNS Message field
// This is the double-JSON structure: SNS.Message contains a JSON string of SESNotification
type SESMessageNotification struct {
	NotificationType string                 `json:"notificationType"`
	Mail             SESMail                `json:"mail"`
	Delivery         *SESDelivery           `json:"delivery,omitempty"`
	Bounce           *SESBounce             `json:"bounce,omitempty"`
	Complaint        *SESComplaint          `json:"complaint,omitempty"`
	Reject           *SESReject             `json:"reject,omitempty"`
	RenderingFailure *SESRenderingFailure   `json:"renderingFailure,omitempty"`
	Receipt          map[string]interface{} `json:"receipt,omitempty"`
}

// SubscriptionConfirmation represents SNS subscription confirmation message
type SubscriptionConfirmation struct {
	Type           string `json:"Type"`
	MessageId      string `json:"MessageId"`
	Token          string `json:"Token"`
	TopicArn       string `json:"TopicArn"`
	Message        string `json:"Message"`
	SubscribeURL   string `json:"SubscribeURL"`
	Timestamp      string `json:"Timestamp"`
	Signature      string `json:"Signature"`
	SigningCertURL string `json:"SigningCertURL"`
}

// UnsubscribeConfirmation represents SNS unsubscribe confirmation message
type UnsubscribeConfirmation struct {
	Type           string `json:"Type"`
	MessageId      string `json:"MessageId"`
	Token          string `json:"Token"`
	TopicArn       string `json:"TopicArn"`
	Message        string `json:"Message"`
	UnsubscribeURL string `json:"UnsubscribeURL"`
	Timestamp      string `json:"Timestamp"`
	Signature      string `json:"Signature"`
	SigningCertURL string `json:"SigningCertURL"`
}
