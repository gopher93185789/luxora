package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

func (p *Postgres) UpdateRefreshToken(ctx context.Context, userId uuid.UUID, refreshToken string) (err error) {
	_, err = p.Pool.Exec(ctx, "UPDATE luxora_user SET refresh_token=$1 WHERE id=$2", refreshToken, userId)
	return
}

func (p *Postgres) UpdateItemSoldViaBid(ctx context.Context, userId uuid.UUID, sold bool, bidID, itemID uuid.UUID) (err error) {
	tx, err := p.Pool.Begin(ctx)
	if err != nil {
		return err
	}

	var (
		soldPrice    decimal.Decimal
		bidCreatedBy uuid.UUID
	)
	err = tx.QueryRow(ctx, "SELECT bid_amount, user_id FROM product_bid WHERE bid_id=$1 AND item_id=$2", bidID, itemID).Scan(&soldPrice, &bidCreatedBy)
	if err != nil {
		tx.Rollback(ctx)
		return err
	}

	_, err = tx.Exec(ctx, "UPDATE luxora_product SET sold=$1, sold_to_user_id=$2 WHERE item_id=$3 AND user_id=$4", sold, bidCreatedBy, itemID, userId)
	if err != nil {
		tx.Rollback(ctx)
		return err
	}

	_, err = tx.Exec(ctx, "INSERT INTO luxora_product_price_history (price, product_id) VALUES ($1, $2)", soldPrice, itemID)
	if err != nil {
		tx.Rollback(ctx)
		return err
	}

	return tx.Commit(ctx)
}
