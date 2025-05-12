package postgres

import (
	"testing"

	"github.com/gopher93185789/luxora/server/pkg/testutils"
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
