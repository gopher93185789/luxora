package store

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/gopher93185789/luxora/server/database/postgres"
	"github.com/gopher93185789/luxora/server/pkg/logger"
	"github.com/gopher93185789/luxora/server/pkg/models"
	"github.com/gopher93185789/luxora/server/pkg/testutils"
	"github.com/shopspring/decimal"
)

func TestCreateNewListing(t *testing.T) {
	conn, clean, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}
	defer clean()

	c := &CoreStoreContext{
		Database: &postgres.Postgres{
			Pool: conn,
		},
		Logger: logger.New(os.Stdout),
	}

	price, err := decimal.NewFromString("19.99")
	if err != nil {
		t.Fatal(err)
	}

	uid, err := c.Database.InsertOauthUser(t.Context(), "jack", "google", "skofk", "")
	if err != nil {
		t.Fatal(err)
	}

	product := &models.Product{
		ItemName:    "rizz",
		Category:    "products",
		Description: "knaye the goat",
		Price:       price,
		Images: []models.ProductImage{
			{
				Image: "wlieblwelkjhe",
				Order: 0,
			},
			{
				Image: "sdvsrtvs",
				Order: 1,
			},
		},
	}

	pid, err := c.CreateNewListing(t.Context(), uid, product)
	if err != nil {
		t.Fatal(err)
	}

	var count int
	err = conn.QueryRow(t.Context(), "SELECT COUNT(*) FROM luxora_product WHERE user_id=$1 AND item_id=$2", uid, pid).Scan(&count)
	if err != nil {
		t.Fatal(err)
	}

	if count != 1 {
		t.Fatal("failed to create new listing")
	}
}

func TestGetListings(t *testing.T) {
	ctx, cancel := context.WithTimeout(t.Context(), 10*time.Second)
	defer cancel()

	pool, _, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}

	c := &CoreStoreContext{
		Database: &postgres.Postgres{
			Pool: pool,
		},
		Logger: logger.New(os.Stdout),
	}

	id, err := c.Database.InsertOauthUser(ctx, "diddy", "github", "hwllo", "")
	if err != nil {
		t.Fatal(err)
	}

	price := decimal.NewFromInt(0)
	product := &models.Product{
		ItemName:    "rizz",
		Category:    "rozz",
		Description: "knaye the goat",
		Price:       price,
		Images: []models.ProductImage{
			{Image: "img1", Order: 0},
			{Image: "img2", Order: 1},
		},
	}

	pid, err := c.CreateNewListing(ctx, id, product)
	if err != nil {
		t.Fatal(err)
	}

	prods, err := c.GetListings(ctx, id, "", "", "", "", "", 40, 1)
	if err != nil {
		t.Fatal(err)
	}

	if len(prods) == 0 || prods[0].ItemID != pid {
		t.Fatal("incorrect product fetched", prods)
	}

	if prods[0].Images[0].Image != product.Images[0].Image {
		t.Fatal("incorrect product image fetched", prods)
	}
}

func TestCreateNewListingWithImageCompression(t *testing.T) {
	conn, clean, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}
	defer clean()

	c := &CoreStoreContext{
		Database: &postgres.Postgres{
			Pool: conn,
		},
		Logger: logger.New(os.Stdout),
	}

	uid, err := c.Database.InsertOauthUser(t.Context(), "jack", "google", "skofk", "")
	if err != nil {
		t.Fatal(err)
	}

	testImage := "Hello, this is a test image content!"
	product := &models.Product{
		ItemName:    "test item",
		Category:    "products",
		Description: "test description",
		Price:       decimal.NewFromInt(100),
		Images: []models.ProductImage{
			{
				Image: testImage,
				Order: 0,
			},
		},
	}

	pid, err := c.CreateNewListing(t.Context(), uid, product)
	if err != nil {
		t.Fatal(err)
	}

	var compressedImage []byte
	err = conn.QueryRow(t.Context(), "SELECT compressed_image FROM luxora_product_image WHERE product_id=$1", pid).Scan(&compressedImage)
	if err != nil {
		t.Fatal(err)
	}

	if len(compressedImage) == 0 {
		t.Fatal("compressed image is empty")
	}

	if len(compressedImage) == len(testImage) {
		t.Fatal("image doesn't appear to be compressed")
	}
}
