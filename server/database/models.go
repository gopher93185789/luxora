package database

import (
	"context"
	"database/sql"
	"github.com/google/uuid"
)

type Database interface {
	// insert
	InsertUser(ctx context.Context, username, email, signupType, passwordHash string) (userID uuid.UUID, err error) 
	InsertOauthUser(ctx context.Context, username, email, provider, provider_user_id string) (userID uuid.UUID, err error) 

	// query
	GetLastLogin(ctx context.Context, userID uuid.UUID) (LastLogin sql.NullTime, err error)
	GetOauthUserIdByUsername(ctx context.Context, username string) (id uuid.UUID, providerID string, err error) 
}