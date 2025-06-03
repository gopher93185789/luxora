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
		c.Logger.Error("Failed to create listing: empty product name")
		return uuid.Nil, fmt.Errorf("invalid product name")
	}

	if product.Price.IsNegative() {
		c.Logger.Error("Failed to create listing: negative price")
		return uuid.Nil, err
	}

	c.Logger.Debug(fmt.Sprintf("Processing %d images for listing", len(product.Images)))
	for i := range product.Images {
		img := []byte(product.Images[i].Image)
		product.Images[i].CompressedImage, err = compression.CompressZSTD(img)
		if err != nil {
			c.Logger.Error(fmt.Sprintf("Image compression failed: %v", err))
			return uuid.Nil, err
		}

		hash := sha256.Sum256(img)
		product.Images[i].Checksum = hex.EncodeToString(hash[:])
	}

	c.Logger.Info(fmt.Sprintf("Creating new listing for user %s: %s", userID, product.ItemName))
	productID, err = c.Database.InsertListing(ctx, userID, product)
	if err != nil {
		c.Logger.Error(fmt.Sprintf("Failed to insert listing: %v", err))
		return uuid.Nil, err
	}

	c.Logger.Info(fmt.Sprintf("Successfully created listing %s", productID))
	return productID, nil
}

func (c *CoreStoreContext) DeleteListing(ctx context.Context, userID uuid.UUID, productId uuid.UUID) (err error) {
	c.Logger.Info(fmt.Sprintf("Deleting listing %s for user %s", productId, userID))
	err = c.Database.DeleteListing(ctx, userID, productId)
	if err != nil {
		c.Logger.Error(fmt.Sprintf("Failed to delete listing: %v", err))
		return err
	}
	c.Logger.Info(fmt.Sprintf("Successfully deleted listing %s", productId))
	return nil
}

func (c *CoreStoreContext) SetItemsSoldViaBid(ctx context.Context, userId uuid.UUID, info *models.SellItemViaBid) (err error) {
	if info.BidID == uuid.Nil {
		c.Logger.Error("Invalid bid ID provided for sale")
		return fmt.Errorf("invalid bid id")
	}

	if info.ItemID == uuid.Nil {
		c.Logger.Error("Invalid item ID provided for sale")
		return fmt.Errorf("invalid item id")
	}

	if userId == uuid.Nil {
		c.Logger.Error("Invalid user ID provided for sale")
		return fmt.Errorf("invalid user id")
	}

	c.Logger.Info(fmt.Sprintf("Marking item %s as sold via bid %s", info.ItemID, info.BidID))
	err = c.Database.UpdateItemSoldViaBid(ctx, userId, true, info.BidID, info.ItemID)
	if err != nil {
		c.Logger.Error(fmt.Sprintf("Failed to update item sold status: %v", err))
		return err
	}

	c.Logger.Info(fmt.Sprintf("Successfully marked item %s as sold", info.ItemID))
	return nil
}

func (c *CoreStoreContext) GetListings(ctx context.Context, userID uuid.UUID, category, searchQuery, startPriceStr, endPriceStr, createdByStr string, limit, page int) (products []models.ProductInfo, err error) {
	if limit < 1 || page < 1 {
		c.Logger.Error(fmt.Sprintf("Invalid pagination parameters: limit=%d, page=%d", limit, page))
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
			c.Logger.Error(fmt.Sprintf("Invalid start price: %s - %v", startPriceStr, err))
			return nil, err
		}
		startPrice = &sp
	}

	if endPriceStr != "" {
		ep, err := decimal.NewFromString(endPriceStr)
		if err != nil {
			c.Logger.Error(fmt.Sprintf("Invalid end price: %s - %v", endPriceStr, err))
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
			c.Logger.Error(fmt.Sprintf("Invalid creator ID: %s", createdByStr))
			return nil, fmt.Errorf("invalid userID")
		}
	}

	c.Logger.Debug(fmt.Sprintf("Fetching listings (page %d, limit %d, category %v, search %v)", page, limit, category, searchQuery))
	products, err = c.Database.GetProducts(ctx, userID, createdBy, ct, searchWQ, startPrice, endPrice, limit, limit*(page-1))
	if err != nil {
		c.Logger.Error(fmt.Sprintf("Failed to get products: %v", err))
		return nil, err
	}

	c.Logger.Debug(fmt.Sprintf("Decompressing images for %d products", len(products)))
	for i := range products {
		for j := range products[i].Images {
			decompressed, err := compression.DecompressZSTD(products[i].Images[j].CompressedImage)
			if err != nil {
				c.Logger.Error(fmt.Sprintf("Failed to decompress image %d for product index %d: %v", j, i, err))
				continue
			}
			products[i].Images[j].Image = string(decompressed)
		}
	}

	c.Logger.Debug(fmt.Sprintf("Successfully retrieved %d products", len(products)))
	return products, nil
}

func (c *CoreStoreContext) Checkout(ctx context.Context, userID uuid.UUID, cart *models.CartItems) (err error) {
	if err := uuid.Validate(userID.String()); err != nil {
		c.Logger.Error(fmt.Sprintf("Invalid user ID for checkout: %s", userID))
		return fmt.Errorf("invalid id")
	}

	if len(cart.Products) == 0 {
		c.Logger.Error("Attempted checkout with empty cart")
		return fmt.Errorf("cannot process empty cart")
	}

	c.Logger.Info(fmt.Sprintf("Processing checkout for user %s with %d items", userID, len(cart.Products)))
	err = c.Database.UpdateItemSoldViaCheckout(ctx, userID, cart)
	if err != nil {
		c.Logger.Error(fmt.Sprintf("Checkout failed: %v", err))
		return err
	}

	c.Logger.Info(fmt.Sprintf("Successfully completed checkout for user %s", userID))
	return nil
}
