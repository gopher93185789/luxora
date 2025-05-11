package postgres

import (
	"testing"

	"github.com/google/uuid"
	"github.com/gopher93185789/luxora/server/pkg/testutils"
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
	id, err := db.InsertOauthUser(t.Context(), "diddy", "email@gmail.diddy.com", "github", "hwllo")
	if err != nil {
		t.Fatal(err)
	}

	if id == uuid.Nil {
		t.Fatal("invalid uuid")
	}

	_, err = db.InsertOauthUser(t.Context(), "dixddy", "email@gmaixl.diddy.com", "github", "hwllo")
	if err == nil {
		t.Fatal("failed to raise error on duplicate user")
	}
}