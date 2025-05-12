package store

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"

	"github.com/google/uuid"
	compression "github.com/gopher93185789/luxora/server/pkg/compressions"
	"github.com/gopher93185789/luxora/server/pkg/models"
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
	return c.DeleteListing(ctx, userID, productId)
}
