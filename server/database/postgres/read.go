package postgres

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
)


func (p *Postgres) GetOauthUserIdByUsername(ctx context.Context, username string) (id uuid.UUID, providerID string, err error)  {
	err = p.Pool.QueryRow(ctx, "SELECT id, provider_user_id FROM luxora_user WHERE username = $1", username).Scan(&id, &providerID)
	return 
}

func (p *Postgres) GetLastLogin(ctx context.Context, userID uuid.UUID) (LastLogin sql.NullTime, err error) {
	err = p.Pool.QueryRow(ctx, "SELECT last_login FROM luxora_user WHERE id = $1", userID).Scan(&LastLogin)
	return 
}

func (p *Postgres) GetRefreshToken(ctx context.Context, userId uuid.UUID) ( refreshToken string, err error) {
	err = p.Pool.QueryRow(ctx, "SELECT refresh_token FROM luxora_user WHERE id=$1", userId).Scan(&refreshToken)
	return
}

func (p *Postgres) GetIsUsernameAndIDByProviderID(ctx context.Context, providerID string) (username string, userID uuid.UUID, err error) {
	err = p.Pool.QueryRow(ctx, "SELECT username, id FROM luxora_user WHERE provider_user_id=$1", providerID).Scan(&username, &userID)
	return
}