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
		c.Logger.Error("Bid creation failed: invalid bid amount (negative)")
		return uuid.Nil, fmt.Errorf("invalid bid amount")
	}

	if len(bid.Message) > 255 {
		c.Logger.Error("Bid creation failed: message exceeds 255 characters")
		return uuid.Nil, fmt.Errorf("message is too long, max 255 characters")
	}

	c.Logger.Info(fmt.Sprintf("Creating new bid for user %s on product %s", userId, bid.ProductID))
	bidID, err = c.Database.InsertBid(ctx, userId, bid)
	if err != nil {
		c.Logger.Error(fmt.Sprintf("Failed to insert bid: %v", err))
		return uuid.Nil, err
	}

	c.Logger.Info(fmt.Sprintf("Successfully created bid %s", bidID))
	return bidID, nil
}

func (c *CoreStoreContext) GetHighestBid(ctx context.Context, userID uuid.UUID, productID uuid.UUID) (bid *models.BidDetails, err error) {
	c.Logger.Debug(fmt.Sprintf("Fetching highest bid for product %s", productID))
	bid, err = c.Database.GetHighestBid(ctx, userID, productID)
	if err != nil {
		c.Logger.Error(fmt.Sprintf("Failed to get highest bid: %v", err))
		return nil, err
	}
	return bid, nil
}

func (c *CoreStoreContext) GetBids(ctx context.Context, userID uuid.UUID, productID uuid.UUID, limit, page int) (bids []models.BidDetails, err error) {
	if limit <= 0 || page <= 0 {
		c.Logger.Error(fmt.Sprintf("Invalid pagination parameters: limit=%d, page=%d", limit, page))
		return nil, fmt.Errorf("invalid 'limit' or 'page' amount: minimum 1")
	}

	c.Logger.Debug(fmt.Sprintf("Fetching bids for product %s (page %d, limit %d)", productID, page, limit))
	bids, err = c.Database.GetBids(ctx, userID, productID, limit, limit*(page-1))
	if err != nil {
		c.Logger.Error(fmt.Sprintf("Failed to get bids: %v", err))
		return nil, err
	}

	c.Logger.Debug(fmt.Sprintf("Retrieved %d bids for product %s", len(bids), productID))
	return bids, nil
}
