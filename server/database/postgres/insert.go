package postgres

import (
	"context"

	"github.com/google/uuid"
)

func (p *Postgres) InsertUser(ctx context.Context, username, email, signupType, passwordHash string) (userID uuid.UUID, err error) {
	tx, err := p.Pool.Begin(ctx)
	if err != nil {
		return uuid.Nil, err
	}
	var id uuid.UUID
	
	err = tx.QueryRow(ctx, "INSERT INTO luxora_user (username, email, signup_type, password_hash)  VALUES ($1, $2, $3, $4) RETURNING id", username, email, signupType, passwordHash).Scan(&id)
	if err != nil {
		tx.Rollback(ctx)
		return uuid.Nil, err
	}

	_, err = tx.Exec(ctx, "INSERT INTO luxora_user_verification (user_id ,isverified)  VALUES ($1, $2)", id, true)
	if err != nil {
		tx.Rollback(ctx)
		return uuid.Nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return uuid.Nil, err
	} 

	return id, nil
}