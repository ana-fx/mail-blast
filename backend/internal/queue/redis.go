package queue

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

var Queue *redis.Client
var ctx = context.Background()

const QueueName = "email_queue"

// InitRedis initializes the Redis client connection
func InitRedis(addr string) error {
	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: "", // No password by default
		DB:       0,
	})

	// Test the connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("failed to connect to Redis: %w", err)
	}

	Queue = rdb
	return nil
}

// EnqueueEmail adds an email job to the queue
func EnqueueEmail(job EmailJob) error {
	if Queue == nil {
		return fmt.Errorf("redis client is not initialized")
	}

	// Marshal job to JSON
	jobData, err := json.Marshal(job)
	if err != nil {
		return fmt.Errorf("failed to marshal job: %w", err)
	}

	// Push into Redis list
	return Queue.LPush(ctx, QueueName, jobData).Err()
}

// Enqueue is a compatibility function for old email handler (deprecated)
func Enqueue(data []byte) error {
	if Queue == nil {
		return fmt.Errorf("redis client is not initialized")
	}
	return Queue.LPush(ctx, QueueName, data).Err()
}
