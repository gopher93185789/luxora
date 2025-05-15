package store

import (
	"context"
	"testing"
	"time"

	"github.com/gopher93185789/luxora/server/database/postgres"
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
	}

	price, err := decimal.NewFromString("19.99")
	if err != nil {
		t.Fatal(err)
	}

	uid, err := c.Database.InsertOauthUser(t.Context(), "jack", "anish@joc.com", "google", "skofk")
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
	}

	id, err := c.Database.InsertOauthUser(ctx, "diddy", "email@gmail.diddy.com", "github", "hwllo")
	if err != nil {
		t.Fatal(err)
	}

	for range 100 {

	}
	price := decimal.NewFromInt(0)
	product := &models.Product{
		ItemName:    "rizz",
		Category:    "rozz",
		Description: "knaye the goat",
		Price:       price,
		Images: []models.ProductImage{
			{Image: "img1", Order: 0, Checksum: "chk1", CompressedImage: make([]byte, 10)},
			{Image: "img2", Order: 1, Checksum: "chk2", CompressedImage: make([]byte, 10)},
		},
	}

	pid, err := c.CreateNewListing(ctx, id, product)
	if err != nil {
		t.Fatal(err)
	}

	prods, err := c.GetListings(ctx, id, "", "", "", "", 40, 1)
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
