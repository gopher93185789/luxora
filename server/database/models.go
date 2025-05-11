package database

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Database interface {
	InsertUser(ctx context.Context, username, email, signupType, passwordHash string) (userID uuid.UUID, err error) 
	GetLastLogin(ctx context.Context, userID uuid.UUID) (LastLogin time.Time, err error)
	GetUserIdByUsername(ctx context.Context, username string) (id uuid.UUID, err error) 
	GetUserIdByEmail(ctx context.Context, email string) (id uuid.UUID, err error) 
}