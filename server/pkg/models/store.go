package models

import (
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
	ProductID uuid.UUID       `json:"product_id"`
}

type CreateBidResponse struct {
	BidID uuid.UUID `json:"bid_id"`
}

type BidDetails struct {
	BidID     uuid.UUID       `json:"bid_id"`
	CreatedBy uuid.UUID       `json:"created_by"`
	BidAmount decimal.Decimal `json:"amount"`
	ProductID uuid.UUID       `json:"product_id"`
	CreatedAt time.Time       `json:"created_at"`
}
