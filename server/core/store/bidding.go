package store

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/gopher93185789/luxora/server/pkg/models"
	"github.com/shopspring/decimal"
)

func (c *CoreStoreContext) CreateBid(ctx context.Context, userId uuid.UUID, bid *models.Bid) (bidID uuid.UUID, err error) {
	if decimal.Zero.IsNegative() {
		return uuid.Nil, fmt.Errorf("invalid bid amount")
	}

	return c.Database.InsertBid(ctx, userId, bid)
}

func (c *CoreStoreContext) GetHighestBid(ctx context.Context, userID uuid.UUID, productID uuid.UUID) (bid *models.BidDetails, err error) {
	return c.Database.GetHighestBid(ctx, userID, productID)
}

func (c *CoreStoreContext) GetBids(ctx context.Context, userID uuid.UUID, productID uuid.UUID, limit, page int) (bids []models.BidDetails, err error) {
	if limit <= 0 || page <= 0 {
		return nil, fmt.Errorf("invalid 'limit' or 'page' amount: minimum 1")
	}

	return c.Database.GetBids(ctx, userID, productID, limit, limit*(page-1))
}
