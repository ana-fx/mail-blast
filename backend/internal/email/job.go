package email

// EmailJob represents an email job in the queue
type EmailJob struct {
	To       string `json:"to"`
	Subject  string `json:"subject"`
	BodyHTML string `json:"body_html"`
	From     string `json:"from"`
}
