package postgres

import (
	"testing"

	"github.com/gopher93185789/luxora/server/pkg/models"
	"github.com/gopher93185789/luxora/server/pkg/testutils"
	"github.com/shopspring/decimal"
)

func TestGetUserIdByUsername(t *testing.T) {
	pool, clean, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}
	defer clean()

	db := Postgres{Pool: pool}

	uzid, err := db.InsertOauthUser(t.Context(), "diddy", "", "github", "hello")
	if err != nil {
		t.Fatal(err)
	}

	uid, pid, err := db.GetOauthUserIdByUsername(t.Context(), "diddy")
	if err != nil {
		t.Fatal(err)
	}

	if uzid != uid {
		t.Fatal("uuids dont match")
	}

	if pid != "hello" {
		t.Fatal("got invalid provider id")
	}

}
func TestGetLastLogin(t *testing.T) {
	pool, clean, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}
	defer clean()

	db := Postgres{Pool: pool}

	uzid, err := db.InsertOauthUser(t.Context(), "diddy", "", "github", "hello")
	if err != nil {
		t.Fatal(err)
	}

	_, err = db.GetLastLogin(t.Context(), uzid)
	if err != nil {
		t.Fatal(err)
	}
}
func TestGetIsUsernameAndIDByProviderID(t *testing.T) {
	pool, clean, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}
	defer clean()

	db := Postgres{Pool: pool}

	uzid, err := db.InsertOauthUser(t.Context(), "diddy", "", "github", "hello")
	if err != nil {
		t.Fatal(err)
	}

	username, id, err := db.GetIsUsernameAndIDByProviderID(t.Context(), "hello")
	if err != nil {
		t.Fatal(err)
	}

	if username != "diddy" {
		t.Fatal("username mismatch")
	}

	if id != uzid {
		t.Fatal("user id mismatch")
	}
}


func TestGetHighestBid(t *testing.T) {
	pool, clean, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}
	defer clean()

	db := Postgres{Pool: pool}
	id, err := db.InsertOauthUser(t.Context(), "diddy", "email@gmail.diddy.com", "github", "hwllo")
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

	bid2, err := decimal.NewFromString("290.22")
	if err != nil {
		t.Fatal(err)
	}

	_, err = db.InsertBid(t.Context(), id, &models.Bid{ProductID: pid, BidAmount: bid})
	if err != nil {
		t.Fatal(err)
	}

	_, err = db.InsertBid(t.Context(), id, &models.Bid{ProductID: pid, BidAmount: bid2})
	if err != nil {
		t.Fatal(err)
	}

	Hbid, err := db.GetHighestBid(t.Context(), id, pid)
	if err != nil {
		t.Fatal(err)
	}

	if !bid2.Equal(Hbid.BidAmount) {
		t.Fatal("highest bid does not match")
	}
}