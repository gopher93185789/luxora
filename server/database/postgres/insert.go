package postgres

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/gopher93185789/luxora/server/pkg/models"
)

func (p *Postgres) InsertUser(ctx context.Context, username, email, signupType, passwordHash string) (userID uuid.UUID, err error) {
	tx, err := p.Pool.Begin(ctx)
	if err != nil {
		return uuid.Nil, err
	}
	var id uuid.UUID

	err = tx.QueryRow(ctx, "INSERT INTO luxora_user (username, email, signup_type, password_hash)  VALUES ($1, $2, $3, $4) RETURNING id", username, strings.ToLower(email), signupType, passwordHash).Scan(&id)
	if err != nil {
		tx.Rollback(ctx)
		return uuid.Nil, err
	}


	if err := tx.Commit(ctx); err != nil {
		return uuid.Nil, err
	}

	return id, nil
}

func (p *Postgres) InsertOauthUser(ctx context.Context, username, email, provider, providerId string) (userID uuid.UUID, err error) {
	tx, err := p.Pool.Begin(ctx)
	if err != nil {
		return uuid.Nil, err
	}
	var id uuid.UUID

	err = tx.QueryRow(ctx, "INSERT INTO luxora_user (username, email, provider, provider_user_id)  VALUES ($1, $2, $3, $4) RETURNING id", username, strings.ToLower(email), provider, providerId).Scan(&id)
	if err != nil {
		tx.Rollback(ctx)
		return uuid.Nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return uuid.Nil, err
	}

	return id, nil
}

func (p *Postgres) InsertListing(ctx context.Context, userId uuid.UUID, product *models.Product) (productId uuid.UUID, err error) {
	tx, err := p.Pool.Begin(ctx)
	if err != nil {
		return uuid.Nil, err
	}

	err = tx.QueryRow(ctx, "INSERT INTO luxora_product (user_id, name, category, description) VALUES ($1, $2, $3, $4) RETURNING item_id", userId, product.ItemName, product.Category, product.Description).Scan(&productId)
	if err != nil {
		tx.Rollback(ctx)
		return uuid.Nil, err
	}

	_, err = tx.Exec(ctx, "INSERT INTO luxora_product_price_history (product_id, price) VALUES ($1, $2)", productId, product.Price)
	if err != nil {
		tx.Rollback(ctx)
		return uuid.Nil, err
	}

	for _, p := range product.Images {
		_, err = tx.Exec(ctx, "INSERT INTO luxora_product_image (product_id, compressed_image, checksum, sort_order) VALUES ($1, $2, $3, $4)",  productId, p.CompressedImage, p.Checksum, p.Order)
		if err != nil {
			tx.Rollback(ctx)
			return uuid.Nil, err
		}
	}

	return productId, tx.Commit(ctx)
}

func (p *Postgres) InsertBid(ctx context.Context, userID uuid.UUID, bid *models.Bid) (bidID uuid.UUID, err error) {
	err = p.Pool.QueryRow(ctx, "INSERT INTO product_bid (item_id, user_id, bid_amount, message) VALUES ($1, $2, $3, $4) RETURNING bid_id", bid.ProductID, userID, bid.BidAmount, bid.Message).Scan(&bidID)
	return
}
