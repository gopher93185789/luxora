package postgres

import (
	"testing"
	"github.com/gopher93185789/luxora/server/pkg/testutils"
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
