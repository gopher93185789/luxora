package database

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
	"github.com/gopher93185789/luxora/server/pkg/models"
	"github.com/shopspring/decimal"
)

type Database interface {
	// insert
	InsertUser(ctx context.Context, username, email, signupType, passwordHash string) (userID uuid.UUID, err error)
	InsertOauthUser(ctx context.Context, username, email, provider, provider_user_id string) (userID uuid.UUID, err error)
	InsertListing(ctx context.Context, userId uuid.UUID, product *models.Product) (productId uuid.UUID, err error)
	InsertBid(ctx context.Context, userID uuid.UUID, bid *models.Bid) (bidID uuid.UUID, err error)

	// query
	GetLastLogin(ctx context.Context, userID uuid.UUID) (LastLogin sql.NullTime, err error)
	GetOauthUserIdByUsername(ctx context.Context, username string) (id uuid.UUID, providerID string, err error)
	GetRefreshToken(ctx context.Context, userId uuid.UUID) (refreshToken string, err error)
	GetIsUsernameAndIDByProviderID(ctx context.Context, providerID string) (username string, userID uuid.UUID, err error)
	GetHighestBid(ctx context.Context, userID uuid.UUID, productID uuid.UUID) (bid *models.BidDetails, err error)
	GetBids(ctx context.Context, userID uuid.UUID, productID uuid.UUID, limit, page int) (bids []models.BidDetails, err error)
	GetProducts(ctx context.Context, userID, createdBy uuid.UUID, category, searchQuery *string, startPrice, endPrice *decimal.Decimal, limit, offset int) (products []models.ProductInfo, err error)

	// update
	UpdateRefreshToken(ctx context.Context, userId uuid.UUID, refreshToken string) (err error)
	UpdateItemSoldViaBid(ctx context.Context, userId uuid.UUID, sold bool, bidID, itemID uuid.UUID) (err error)

	// delete
	DeleteListing(ctx context.Context, userID uuid.UUID, productId uuid.UUID) (err error)
}
