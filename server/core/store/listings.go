package store

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"

	"github.com/google/uuid"
	compression "github.com/gopher93185789/luxora/server/pkg/compressions"
	"github.com/gopher93185789/luxora/server/pkg/models"
	"github.com/shopspring/decimal"
)

func (c *CoreStoreContext) CreateNewListing(ctx context.Context, userID uuid.UUID, product *models.Product) (productID uuid.UUID, err error) {
	if product.ItemName == "" {
		return uuid.Nil, fmt.Errorf("invalid product name")
	}

	if product.ItemName == "" {
		return uuid.Nil, fmt.Errorf("invalid product name")
	}

	if product.Price.IsNegative() {
		return uuid.Nil, err
	}

	for i := range product.Images {
		img := []byte(product.Images[i].Image)
		product.Images[i].CompressedImage, err = compression.CompressZSTD(img)
		if err != nil {
			return uuid.Nil, err
		}

		hash := sha256.Sum256(img)
		product.Images[i].Checksum = hex.EncodeToString(hash[:])
	}

	return c.Database.InsertListing(ctx, userID, product)
}

func (c *CoreStoreContext) DeleteListing(ctx context.Context, userID uuid.UUID, productId uuid.UUID) (err error) {
	return c.Database.DeleteListing(ctx, userID, productId)
}

func (c *CoreStoreContext) SetItemsSoldViaBid(ctx context.Context, userId uuid.UUID, info *models.SellItemViaBid) (err error) {
	if info.BidID == uuid.Nil {
		return fmt.Errorf("invalid bid id")
	}

	if info.ItemID == uuid.Nil {
		return fmt.Errorf("invalid item id")
	}

	if userId == uuid.Nil {
		return fmt.Errorf("invalid user id")
	}

	return c.Database.UpdateItemSoldViaBid(ctx, userId, true, info.BidID, info.ItemID)
}

func (c *CoreStoreContext) GetListings(ctx context.Context, userID uuid.UUID, category, searchQuery, startPriceStr, endPriceStr, createdByStr string, limit, page int) (products []models.ProductInfo, err error) {
	if limit < 1 || page < 1 {
		return nil, fmt.Errorf("invalid limit or page param")
	}

	var (
		startPrice *decimal.Decimal = nil
		endPrice   *decimal.Decimal = nil
		ct         *string          = nil
		createdBy  uuid.UUID        = uuid.Nil
		searchWQ   *string          = nil
	)

	if startPriceStr != "" {
		sp, err := decimal.NewFromString(startPriceStr)
		if err != nil {
			return nil, err
		}
		startPrice = &sp
	}

	if endPriceStr != "" {
		ep, err := decimal.NewFromString(endPriceStr)
		if err != nil {
			return nil, err
		}
		endPrice = &ep
	}

	if category != "" {
		ct = &category
	}

	if searchQuery != "" {
		searchWQ = &searchQuery
	}

	if createdByStr != "" {
		createdBy, err = uuid.Parse(createdByStr)
		if err != nil {
			return nil, fmt.Errorf("invalid userID")
		}
	}

	products, err = c.Database.GetProducts(ctx, userID, createdBy, ct, searchWQ, startPrice, endPrice, limit, limit*(page-1))
	if err != nil {
		return nil, err
	}

	for i := range products {
		for j := range products[i].Images {
			decompressed, err := compression.DecompressZSTD(products[i].Images[j].CompressedImage)
			if err != nil {
				continue
			}

			products[i].Images[j].Image = string(decompressed)
		}
	}

	return products, nil
}

func (c *CoreStoreContext) Checkout(ctx context.Context, userID uuid.UUID, cart *models.CartItems) (err error) {
	if err := uuid.Validate(userID.String()); err != nil {
		return fmt.Errorf("invalid id")
	}

	if len(cart.Products) == 0 {
		return fmt.Errorf("cannot process empty cart")
	}

	return c.Database.UpdateItemSoldViaCheckout(ctx, userID, cart)
}
