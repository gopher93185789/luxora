package postgres

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

func (p *Postgres) DeleteListing(ctx context.Context, userID uuid.UUID, productId uuid.UUID) (err error) {
	tx, err := p.Pool.Begin(ctx)
	if err != nil {
		return err
	}

	t, err := tx.Exec(ctx, "DELETE FROM luxora_product WHERE user_id=$1 AND item_id=$2", userID, productId)
	if err != nil {
		tx.Rollback(ctx)
		return err
	}

	if t.RowsAffected() != 1 {
		tx.Rollback(ctx)
		return fmt.Errorf("failed to delete listing")
	}

	return tx.Commit(ctx)
}
