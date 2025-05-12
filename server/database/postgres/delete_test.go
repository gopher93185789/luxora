package postgres

import (
	"testing"

	"github.com/gopher93185789/luxora/server/pkg/models"
	"github.com/gopher93185789/luxora/server/pkg/testutils"
	"github.com/shopspring/decimal"
)

func TestDeleteListing(t *testing.T) {
	pool, clean, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}
	defer clean()

	db := Postgres{Pool: pool}
	id, err := db.InsertUser(t.Context(), "diddy", "email@gmail.diddy.com", "github", "")
	if err != nil {
		t.Fatal(err)
	}

	price, err := decimal.NewFromString("19.99")
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
				Checksum: "slkdfkljsfd",
				CompressedImage: make([]byte, 10),
			},
			{
				Image: "sdvsrtvs",
				Order: 1,
				Checksum: "slkdfksgvsljsfd",
				CompressedImage: make([]byte, 10),
			},
		},
	}

	pid, err := db.InsertListing(t.Context(), id, product)
	if err != nil {
		t.Fatal(err)
	}

	err = db.DeleteListing(t.Context(), id, pid)
	if err != nil {
		t.Fatal(err)
	}
}