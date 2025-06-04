package postgres

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/gopher93185789/luxora/server/pkg/models"
	"github.com/gopher93185789/luxora/server/pkg/testutils"
	"github.com/shopspring/decimal"
)

func TestUpdateRefreshToken(t *testing.T) {
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

	err = db.UpdateRefreshToken(t.Context(), id, "higga")
	if err != nil {
		t.Fatal(err)
	}

}

func TestUpdateItemSoldViaBid(t *testing.T) {
	pool, clean, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}
	defer clean()

	db := Postgres{Pool: pool}
	id, err := db.InsertOauthUser(t.Context(), "diddy", "github", "hwllo", "")
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

	err = db.UpdateItemSoldViaBid(t.Context(), id, true, Hbid.BidID, pid)
	if err != nil {
		t.Fatal(err)
	}

	var sold bool
	err = db.Pool.QueryRow(t.Context(), "SELECT sold FROM luxora_product WHERE item_id=$1", pid).Scan(&sold)
	if err != nil {
		t.Fatal(err)
	}

	if !sold {
		t.Fatal("failed to update sold on item")
	}
}

func TestUpdateItemSoldViaCheckout(t *testing.T) {
	ctx := context.Background()
	pool, clean, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}
	defer clean()

	db := Postgres{Pool: pool}
	id, err := db.InsertOauthUser(t.Context(), "diddy", "github", "hwllo", "")
	if err != nil {
		t.Fatal(err)
	}

	price := decimal.NewFromInt(100)

	products := []models.Product{
		{
			ItemName:    "rizz hat",
			Category:    "fashion",
			Description: "A stylish rizz hat",
			Price:       price,
			Images:      []models.ProductImage{{Image: "img1", Order: 0, Checksum: "chk1", CompressedImage: make([]byte, 10)}},
		},
		{
			ItemName:    "rizz shirt",
			Category:    "fashion",
			Description: "A fashionable shirt",
			Price:       price,
			Images:      []models.ProductImage{{Image: "img2", Order: 0, Checksum: "chk2", CompressedImage: make([]byte, 10)}},
		},
		{
			ItemName:    "charizma shirt",
			Category:    "fashion",
			Description: "A fashionable shirt",
			Price:       price,
			Images:      []models.ProductImage{{Image: "img2", Order: 0, Checksum: "chk2", CompressedImage: make([]byte, 10)}},
		},
		{
			ItemName:    "basketball",
			Category:    "sports",
			Description: "Standard basketball",
			Price:       price,
			Images:      []models.ProductImage{{Image: "img3", Order: 0, Checksum: "chk3", CompressedImage: make([]byte, 10)}},
		},
	}

	var insertedIDs []uuid.UUID
	for _, prod := range products {
		pid, err := db.InsertListing(ctx, id, &prod)
		if err != nil {
			t.Fatal(err)
		}
		insertedIDs = append(insertedIDs, pid)
	}

	err = db.UpdateItemSoldViaCheckout(ctx, id, &models.CartItems{Products: insertedIDs})
	if err != nil {
		t.Fatal(err)
	}

	rows, err := db.Pool.Query(ctx, "SELECT sold, sold_to_user_id FROM luxora_product WHERE item_id=ANY($1)", insertedIDs)
	if err != nil {
		t.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var (
			sold   bool
			soldTo uuid.UUID
		)
		err = rows.Scan(&sold, &soldTo)
		if err != nil {
			t.Fatal(err)
		}
		if sold != true {
			t.Fatal("failed to update sold")
		}

		if soldTo != id {
			t.Fatal("invalid sold to id")
		}
	}
}

func TestUpdateItemListing(t *testing.T) {
	ctx := context.Background()
	pool, clean, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}
	defer clean()

	db := Postgres{Pool: pool}
	id, err := db.InsertOauthUser(t.Context(), "diddy", "github", "hwllo", "")
	if err != nil {
		t.Fatal(err)
	}

	price := decimal.NewFromInt(100)

	product := models.Product{
		ItemName:    "rizz hat",
		Category:    "fashion",
		Description: "A stylish rizz hat",
		Price:       price,
		Images:      []models.ProductImage{{Image: "img1", Order: 0, Checksum: "chk1", CompressedImage: make([]byte, 10)}},
	}

	pid, err := db.InsertListing(ctx, id, &product)
	if err != nil {
		t.Fatal(err)
	}

	err = db.UpdateItemListing(ctx, id, &models.UpdateProduct{
		Id:          pid,
		Description: "hai huzz",
		Name:        "rizz",
	})

	if err != nil {
		t.Fatal(err)
	}
}
