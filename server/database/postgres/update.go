package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/gopher93185789/luxora/server/pkg/models"
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

func (p *Postgres) UpdateItemSoldViaCheckout(ctx context.Context, buyerID uuid.UUID, cart *models.CartItems) (err error) {
	tx, err := p.Pool.Begin(ctx)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, "UPDATE luxora_product SET sold=$1, sold_to_user_id=$2 WHERE item_id=ANY($3)", true, buyerID, cart.Products)
	if err != nil {
		tx.Rollback(ctx)
		return err
	}

	return tx.Commit(ctx)
}

func (p *Postgres) UpdateItemListing(ctx context.Context, userID uuid.UUID, update *models.UpdateProduct) (err error) {
	var (
		args                     = []any{}
		queries                  = []string{}
		builder *strings.Builder = &strings.Builder{}
	)

	builder.WriteString("UPDATE luxora_product SET ")

	if update.Category != "" {
		args = append(args, update.Category)
		queries = append(queries, fmt.Sprintf(" category=$%v", len(args)))
	}
	if update.Description != "" {
		args = append(args, update.Description)
		queries = append(queries, fmt.Sprintf(" description=$%v", len(args)))
	}
	if update.Name != "" {
		args = append(args, update.Name)
		queries = append(queries, fmt.Sprintf(" name=$%v", len(args)))
	}

	builder.WriteString(strings.Join(queries, ","))
	args = append(args, userID)
	builder.WriteString(fmt.Sprintf(" WHERE item_id=$%v", len(args)))

	fmt.Println(builder.String())

	_, err = p.Pool.Exec(ctx, builder.String(), args...)

	return
}
