package models

import "github.com/shopspring/decimal"

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
