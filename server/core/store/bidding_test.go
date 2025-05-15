package store

import (
	"testing"

	"github.com/google/uuid"
	"github.com/gopher93185789/luxora/server/database/postgres"
	"github.com/gopher93185789/luxora/server/pkg/models"
	"github.com/gopher93185789/luxora/server/pkg/testutils"
	"github.com/shopspring/decimal"
)

func TestCreateNewBid(t *testing.T) {
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

	amount, err := decimal.NewFromString("200.99")
	if err != nil {
		t.Fatal(err)
	}

	bidId, err := c.CreateBid(t.Context(), uid, &models.Bid{
		BidAmount: amount,
		ProductID: pid,
	})

	if err != nil {
		t.Fatal(err)
	}

	var count uuid.UUID
	err = conn.QueryRow(t.Context(), "SELECT item_id FROM product_bid WHERE bid_id=$1", bidId).Scan(&count)
	if err != nil {
		t.Fatal(err)
	}

	if count != pid {
		t.Fatal("failed to create bid ")
	}
}

func TestGetHighestBid(t *testing.T) {
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

	amount, err := decimal.NewFromString("200.99")
	if err != nil {
		t.Fatal(err)
	}

	nbid := &models.Bid{
		BidAmount: amount,
		ProductID: pid,
	}

	_, err = c.CreateBid(t.Context(), uid, nbid)

	amount, err = decimal.NewFromString("202.99")
	if err != nil {
		t.Fatal(err)
	}

	nbid = &models.Bid{
		BidAmount: amount,
		ProductID: pid,
	}

	_, err = c.CreateBid(t.Context(), uid, nbid)

	if err != nil {
		t.Fatal(err)
	}

	bidD, err := c.GetHighestBid(t.Context(), uid, pid)
	if err != nil {
		t.Fatal(err)
	}

	if !nbid.BidAmount.Equal(bidD.BidAmount) {
		t.Fatal("invalid bids")
	}
}

func TestGetBids(t *testing.T) {
	pool, clean, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}
	defer clean()

	c := &CoreStoreContext{
		Database: &postgres.Postgres{
			Pool: pool,
		},
	}

	id, err := c.Database.InsertOauthUser(t.Context(), "diddy", "email@gmail.diddy.com", "github", "hwllo")
	if err != nil {
		t.Fatal(err)
	}

	price, err := decimal.NewFromString("0")
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

	pid, err := c.CreateNewListing(t.Context(), id, product)
	if err != nil {
		t.Fatal(err)
	}

	for i := range 100 {
		_, err := c.CreateBid(t.Context(), id, &models.Bid{
			BidAmount: decimal.NewFromInt(int64(i)),
			ProductID: pid,
		})

		if err != nil {
			t.Fatal(err)
		}
	}

	bids, err := c.GetBids(t.Context(), id, pid, -2, 0)
	if err == nil {
		t.Fatal("failed to raise error on invalid limit or page amount")
	}

	bids, err = c.GetBids(t.Context(), id, pid, 100, 1)
	if err != nil {
		t.Fatal(err)
	}

	if len(bids) != 100 {
		t.Fatalf("got insufficxient amount of bids got: %v, want: %v", len(bids), 100)
	}
}
