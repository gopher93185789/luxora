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
	InsertOauthUser(ctx context.Context, username, provider, providerId, profileImageLink string) (userID uuid.UUID, err error)
	InsertListing(ctx context.Context, userId uuid.UUID, product *models.Product) (productId uuid.UUID, err error)
	InsertBid(ctx context.Context, userID uuid.UUID, bid *models.Bid) (bidID uuid.UUID, err error)

	// query
	GetLastLogin(ctx context.Context, userID uuid.UUID) (LastLogin sql.NullTime, err error)
	GetOauthUserIdByProviderID(ctx context.Context, pid string) (id uuid.UUID, err error)
	GetRefreshToken(ctx context.Context, userId uuid.UUID) (refreshToken string, err error)
	GetIsUsernameAndIDByProviderID(ctx context.Context, providerID string) (username string, userID uuid.UUID, err error)
	GetHighestBid(ctx context.Context, userID uuid.UUID, productID uuid.UUID) (bid *models.BidDetails, err error)
	GetProductById(ctx context.Context, productID uuid.UUID) (product models.ProductInfo, err error)

	GetBids(ctx context.Context, userID uuid.UUID, productID uuid.UUID, limit, page int) (bids []models.BidDetails, err error)
	GetUserBids(ctx context.Context, userID uuid.UUID, limit, offset int) (bids []models.BidDetails, err error)
	GetBidsOnUserListings(ctx context.Context, userID uuid.UUID) (bidsByProduct []models.BidsOnUserListing, err error)
	GetProducts(ctx context.Context, userID, createdBy uuid.UUID, category, searchQuery *string, startPrice, endPrice *decimal.Decimal, limit, offset int) (products []models.ProductInfo, err error)
	GetUserDetails(ctx context.Context, userID uuid.UUID) (details models.UserDetails, err error)

	// update
	UpdateRefreshToken(ctx context.Context, userId uuid.UUID, refreshToken string) (err error)
	UpdateItemSoldViaBid(ctx context.Context, userId uuid.UUID, sold bool, bidID, itemID uuid.UUID) (err error)
	UpdateItemSoldViaCheckout(ctx context.Context, buyerID uuid.UUID, cart *models.CartItems) (err error)
	UpdateItemListing(ctx context.Context, userID uuid.UUID, update *models.UpdateProduct) (err error)
	// delete
	DeleteListing(ctx context.Context, userID uuid.UUID, productId uuid.UUID) (err error)
}
