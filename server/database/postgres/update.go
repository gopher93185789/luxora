package postgres

import (
	"context"
	"github.com/google/uuid"
)

func (p *Postgres) UpdateRefreshToken(ctx context.Context, userId uuid.UUID, refreshToken string) (err error) {
	_, err = p.Pool.Exec(ctx, "UPDATE SET refresh_token=$1 WHERE id= $2", refreshToken, userId)
	return
}