package store

import (
	"testing"


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
		ItemName: "rizz",
		Category: "products",
		Description: "knaye the goat",
		Price: price,
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