package database

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
	"github.com/gopher93185789/luxora/server/pkg/models"
)

type Database interface {
	// insert
	InsertUser(ctx context.Context, username, email, signupType, passwordHash string) (userID uuid.UUID, err error)
	InsertOauthUser(ctx context.Context, username, email, provider, provider_user_id string) (userID uuid.UUID, err error)
	InsertListing(ctx context.Context, userId uuid.UUID, product *models.Product) (productId uuid.UUID, err error)

	// query
	GetLastLogin(ctx context.Context, userID uuid.UUID) (LastLogin sql.NullTime, err error)
	GetOauthUserIdByUsername(ctx context.Context, username string) (id uuid.UUID, providerID string, err error)
	GetRefreshToken(ctx context.Context, userId uuid.UUID) (refreshToken string, err error)
	GetIsUsernameAndIDByProviderID(ctx context.Context, providerID string) (username string, userID uuid.UUID, err error)

	// update
	UpdateRefreshToken(ctx context.Context, userId uuid.UUID, refreshToken string) (err error)
}
