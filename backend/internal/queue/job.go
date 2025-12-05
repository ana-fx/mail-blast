package queue

// EmailJob represents an email job in the queue
type EmailJob struct {
	ClientID   string   `json:"client_id"`
	ContactIDs []string `json:"contact_ids"`
	TemplateID string   `json:"template_id"`
	BatchID    string   `json:"batch_id"`
}

