package models

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type ProductImage struct {
	Image           string `json:"base_64_image"`
	Order           int    `json:"order"`
	Checksum        string
	CompressedImage []byte
}

type Product struct {
	ItemName    string          `json:"name"`
	Category    string          `json:"category"`
	Description string          `json:"description"`
	Price       decimal.Decimal `json:"price"`
	Images      []ProductImage  `json:"product_images"`
}

type Bid struct {
	BidAmount decimal.Decimal `json:"amount"`
	Message   string          `json:"message"`
	ProductID uuid.UUID       `json:"product_id"`
}

type CreateBidResponse struct {
	BidID uuid.UUID `json:"bid_id"`
}

type BidDetails struct {
	BidID     uuid.UUID       `json:"bid_id"`
	Message   string          `json:"message"`
	CreatedBy uuid.UUID       `json:"created_by"`
	BidAmount decimal.Decimal `json:"amount"`
	ProductID uuid.UUID       `json:"product_id"`
	CreatedAt time.Time       `json:"created_at"`
}

type SellItemViaBid struct {
	BidID  uuid.UUID `json:"bid_id"`
	ItemID uuid.UUID `json:"item_id"`
}

type ProductInfo struct {
	ItemID      uuid.UUID       `json:"id"`
	Name        string          `json:"name"`
	CreatedBy   uuid.UUID       `json:"created_by"`
	CreatedAt   time.Time       `json:"created_at"`
	Category    string          `json:"category"`
	Description string          `json:"description"`
	Price       decimal.Decimal `json:"price"`
	Currency    string          `json:"string"`
	Images      []ProductImage  `json:"product_images"`
}

type UserDetails struct {
	UserID           uuid.UUID      `json:"id"`
	Username         string         `json:"username"`
	Email            sql.NullString `json:"email"`
	ProfileImageLink string         `json:"profile_image_link"`
}

type CartItems struct {
	Products []uuid.UUID `json:"products"`
}

type BidsOnUserListing struct {
	ProductID    uuid.UUID    `json:"product_id"`
	ProductName  string       `json:"product_name"`
	ProductImage string       `json:"product_image,omitempty"`
	Bids         []BidDetails `json:"bids"`
}
