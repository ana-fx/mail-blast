package email

import (
	"context"
	"sync"

	"backend/internal/models"
	"backend/internal/repositories"
)


// SendEmailJob represents an email job to be processed by the worker queue
type SendEmailJob struct {
	EmailRecord *models.EmailMessageRecord
	From        string
	To          string
	Subject     string
	HTMLBody    string
	TextBody    string
}

// Queue represents the email job queue
type Queue struct {
	jobs        chan SendEmailJob
	workers     int
	wg          sync.WaitGroup
	sender      EmailSender
	emailRepo   repositories.EmailRepository
	ctx         context.Context
	cancel      context.CancelFunc
}

// NewQueue creates a new email queue with workers
func NewQueue(workers int, sender EmailSender, emailRepo repositories.EmailRepository) *Queue {
	ctx, cancel := context.WithCancel(context.Background())
	return &Queue{
		jobs:      make(chan SendEmailJob, 100), // Buffered channel with capacity 100
		workers:   workers,
		sender:   sender,
		emailRepo: emailRepo,
		ctx:       ctx,
		cancel:    cancel,
	}
}

// Start starts the worker pool
func (q *Queue) Start() {
	for i := 0; i < q.workers; i++ {
		q.wg.Add(1)
		go q.worker(i)
	}
}

// Stop stops the worker pool gracefully
func (q *Queue) Stop() {
	close(q.jobs)
	q.cancel()
	q.wg.Wait()
}

// Enqueue adds an email job to the queue
func (q *Queue) Enqueue(job SendEmailJob) error {
	select {
	case q.jobs <- job:
		return nil
	case <-q.ctx.Done():
		return q.ctx.Err()
	default:
		// Queue is full
		return ErrQueueFull
	}
}

// worker processes email jobs from the queue
func (q *Queue) worker(id int) {
	defer q.wg.Done()

	for {
		select {
		case job, ok := <-q.jobs:
			if !ok {
				// Channel closed
				return
			}
			q.processJob(job, id)
		case <-q.ctx.Done():
			return
		}
	}
}

// processJob processes a single email job
func (q *Queue) processJob(job SendEmailJob, _ int) {
	// Create email message
	msg := EmailMessage{
		From:     job.From,
		To:       job.To,
		Subject:  job.Subject,
		HTMLBody: job.HTMLBody,
		TextBody: job.TextBody,
		Headers: map[string]string{
			"Message-ID": job.EmailRecord.MessageID,
		},
	}

	// Send email
	err := q.sender.SendEmail(q.ctx, msg)

	// Update status
	if err != nil {
		// Update to failed
		q.emailRepo.UpdateEmailStatus(q.ctx, job.EmailRecord.ID, "failed")
	} else {
		// Update to sent
		q.emailRepo.UpdateEmailStatus(q.ctx, job.EmailRecord.ID, "sent")
	}
}

// Errors
var (
	ErrQueueFull = &QueueError{Message: "email queue is full"}
)

type QueueError struct {
	Message string
}

func (e *QueueError) Error() string {
	return e.Message
}

