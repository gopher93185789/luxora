package postgres

import (
	"testing"

	"github.com/google/uuid"
	"github.com/gopher93185789/luxora/server/pkg/models"
	"github.com/gopher93185789/luxora/server/pkg/testutils"
	"github.com/shopspring/decimal"
)

func TestInsertUser(t *testing.T) {
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

	if id == uuid.Nil {
		t.Fatal("invalid uuid")
	}

	_, err = db.InsertUser(t.Context(), "diddy", "email@gmail.diddy.com", "github", "")
	if err == nil {
		t.Fatal("failed to raise error on duplicate user")
	}

}

func TestInsertOauthUser(t *testing.T) {
	pool, clean, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}
	defer clean()

	db := Postgres{Pool: pool}
	id, err := db.InsertOauthUser(t.Context(), "diddy", "email@gmail.diddy.com", "github", "hwllo", "")
	if err != nil {
		t.Fatal(err)
	}

	if id == uuid.Nil {
		t.Fatal("invalid uuid")
	}

	_, err = db.InsertOauthUser(t.Context(), "dixddy", "email@gmaixl.diddy.com", "github", "hwllo", "")
	if err == nil {
		t.Fatal("failed to raise error on duplicate user")
	}
}

func TestInsertListing(t *testing.T) {
	pool, clean, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}
	defer clean()

	db := Postgres{Pool: pool}
	id, err := db.InsertOauthUser(t.Context(), "diddy", "email@gmail.diddy.com", "github", "hwllo", "")
	if err != nil {
		t.Fatal(err)
	}

	price, err := decimal.NewFromString("19.99")
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
				Image:           "wlieblwelkjhe",
				Order:           0,
				Checksum:        "slkdfkljsfd",
				CompressedImage: make([]byte, 10),
			},
			{
				Image:           "sdvsrtvs",
				Order:           1,
				Checksum:        "slkdfksgvsljsfd",
				CompressedImage: make([]byte, 10),
			},
		},
	}

	_, err = db.InsertListing(t.Context(), id, product)
	if err != nil {
		t.Fatal(err)
	}
}

func TestInsertBid(t *testing.T) {
	pool, clean, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}
	defer clean()

	db := Postgres{Pool: pool}
	id, err := db.InsertOauthUser(t.Context(), "diddy", "email@gmail.diddy.com", "github", "hwllo", "")
	if err != nil {
		t.Fatal(err)
	}

	price, err := decimal.NewFromString("19.99")
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
				Image:           "wlieblwelkjhe",
				Order:           0,
				Checksum:        "slkdfkljsfd",
				CompressedImage: make([]byte, 10),
			},
			{
				Image:           "sdvsrtvs",
				Order:           1,
				Checksum:        "slkdfksgvsljsfd",
				CompressedImage: make([]byte, 10),
			},
		},
	}

	pid, err := db.InsertListing(t.Context(), id, product)
	if err != nil {
		t.Fatal(err)
	}

	bid, err := decimal.NewFromString("200.22")
	if err != nil {
		t.Fatal(err)
	}

	inmsg := "gki"
	bID, err := db.InsertBid(t.Context(), id, &models.Bid{ProductID: pid, BidAmount: bid, Message: inmsg})
	if err != nil {
		t.Fatal(err)
	}

	var message string
	err = db.Pool.QueryRow(t.Context(), "SELECT message FROM product_bid WHERE bid_id=$1", bID).Scan(&message)
	if err != nil {
		t.Fatal(err)
	}

	if message != inmsg {
		t.Fatalf("messages dont match, got: %v, want: %v", message, inmsg)
	}
}
