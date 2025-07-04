package postgres

import (
	"context"
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
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

	uzid, err := db.InsertOauthUser(t.Context(), "diddy", "github", "hello", "")
	if err != nil {
		t.Fatal(err)
	}

	uid, err := db.GetOauthUserIdByProviderID(t.Context(), "hello")
	if err != nil {
		t.Fatal(err)
	}

	if uzid != uid {
		t.Fatal("uuids dont match")
	}

}
func TestGetUserDetails(t *testing.T) {
	pool, clean, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}
	defer clean()

	db := Postgres{Pool: pool}

	userame := "diddy"
	pfp := "ksfjkkjsfksjn"

	uzid, err := db.InsertOauthUser(t.Context(), userame, "github", "hello", pfp)
	if err != nil {
		t.Fatal(err)
	}

	details, err := db.GetUserDetails(t.Context(), uzid)
	if err != nil {
		t.Fatal(err)
	}

	if details.Username != userame {
		t.Fatal("usernames dont match")
	}

	if details.ProfileImageLink != pfp {
		t.Fatal("profile links dont match")
	}

}
func TestGetLastLogin(t *testing.T) {
	pool, clean, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}
	defer clean()

	db := Postgres{Pool: pool}

	uzid, err := db.InsertOauthUser(t.Context(), "diddy", "github", "hello", "")
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

	uzid, err := db.InsertOauthUser(t.Context(), "diddy", "github", "hello", "")
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
}

func TestGetBids(t *testing.T) {
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

	pid, err := db.InsertListing(t.Context(), id, product)
	if err != nil {
		t.Fatal(err)
	}

	for i := range 100 {
		_, err := db.InsertBid(t.Context(), id, &models.Bid{
			BidAmount: decimal.NewFromInt(int64(i)),
			ProductID: pid,
		})

		if err != nil {
			t.Fatal(err)
		}
	}

	bids, err := db.GetBids(t.Context(), id, pid, 100, 0)
	if err != nil {
		t.Fatal(err)
	}

	if len(bids) != 100 {
		t.Fatalf("got insufficxient amount of bids got: %v, want: %v", len(bids), 100)
	}
}

func TestGetProducts(t *testing.T) {
	ctx, cancel := context.WithTimeout(t.Context(), 10*time.Second)
	defer cancel()

	pool, _, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}

	db := Postgres{Pool: pool}

	id, err := db.InsertOauthUser(ctx, "diddy", "github", "hwllo", "")
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

	pid, err := db.InsertListing(ctx, id, product)
	if err != nil {
		t.Fatal(err)
	}

	prods, err := db.GetProducts(ctx, id, uuid.Nil, nil, nil, nil, nil, 40, 0)
	if err != nil {
		t.Fatal(err)
	}

	if len(prods) == 0 || prods[0].ItemID != pid {
		t.Fatal("incorrect product fetched")
	}
}


func BenchmarkGetProducts(b *testing.B) {
	ctx, cancel := context.WithTimeout(b.Context(), 10*time.Second)
	defer cancel()

	pool, _, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		b.Fatal(err)
	}

	db := Postgres{Pool: pool}

	id, err := db.InsertOauthUser(ctx, "diddy", "github", "hwllo", "")
	if err != nil {
		b.Fatal(err)
	}

	for range 100 {
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

		_, err := db.InsertListing(ctx, id, product)
		if err != nil {
			b.Fatal(err)
		}
	}

	b.ResetTimer()
	for b.Loop() {
		_, err := db.GetProducts(ctx, id, uuid.Nil, nil, nil, nil, nil, 40, 0)
		if err != nil {
			b.Fatal(err)
		}
	}
}

func TestGetSimiliarProductsWith(t *testing.T) {
	ctx, cancel := context.WithTimeout(t.Context(), 10*time.Second)
	defer cancel()

	pool, _, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}

	db := Postgres{Pool: pool}

	id, err := db.InsertOauthUser(ctx, "diddy", "github", "hwllo", "")
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

	for _, prod := range products {
		_, err := db.InsertListing(ctx, id, &prod)
		if err != nil {
			t.Fatal(err)
		}
	}

	t.Run("search matching term", func(t *testing.T) {
		searchQ := "rozz"
		results, err := db.GetProducts(ctx, id, uuid.Nil, nil, &searchQ, nil, nil, 40, 0)
		if err != nil {
			t.Fatal(err)
		}

		if len(results) != 2 {
			t.Fatalf("expected 2 results, got %d", len(results))
		}

		for _, r := range results {
			if !strings.Contains(strings.ToLower(r.Name), "rizz") {
				t.Fatalf("unexpected result: %+v", r)
			}
		}
	})

	t.Run("ball", func(t *testing.T) {
		searchQ := "ball"
		results, err := db.GetProducts(ctx, id, uuid.Nil, nil, &searchQ, nil, nil, 40, 0)
		if err != nil {
			t.Fatal(err)
		}

		if len(results) != 1 {
			t.Fatalf("expected 1 result, got %d", len(results))
		}

		for _, r := range results {
			if !strings.Contains(strings.ToLower(r.Name), "ball") {
				t.Fatalf("unexpected result: %+v", r)
			}
		}
	})

	t.Run("search non-matching term", func(t *testing.T) {
		searchQ := "nonexistent"
		results, err := db.GetProducts(ctx, id, uuid.Nil, nil, &searchQ, nil, nil, 40, 0)
		if err != nil {
			t.Fatal(err)
		}

		if len(results) != 0 {
			t.Fatalf("expected 0 results, got %d", len(results))
		}
	})
}

func TestGetProductsById(t *testing.T) {
	ctx, cancel := context.WithTimeout(t.Context(), 10*time.Second)
	defer cancel()

	pool, _, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}

	db := Postgres{Pool: pool}

	t.Log("Inserting user")
	id, err := db.InsertOauthUser(ctx, "diddy", "github", "hwllo", "")
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

	pid, err := db.InsertListing(ctx, id, product)
	if err != nil {
		t.Fatal(err)
	}

	t.Log("Fetching products")
	prod, err := db.GetProductById(ctx, pid)
	if err != nil {
		t.Fatal(err)
	}

	fmt.Println(prod)
}
