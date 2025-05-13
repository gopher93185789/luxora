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