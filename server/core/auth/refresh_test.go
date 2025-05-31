package auth

import (
	"testing"
	"time"

	"github.com/gopher93185789/luxora/server/database/postgres"
	"github.com/gopher93185789/luxora/server/pkg/testutils"
	"github.com/gopher93185789/luxora/server/pkg/token"
)

func TestRefreshToken(t *testing.T) {
	conn, clean, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		t.Fatal(err)
	}
	defer clean()

	c := CoreAuthContext{
		Database: &postgres.Postgres{
			Pool: conn,
		},
		TokenConfig: token.BstConfig{
			SecretKey: []byte("skjvkfbvdkfhvjfvkjf"),
		},
	}

	uid, err := c.Database.InsertUser(t.Context(), "dffdf@dkjfdj.com", "sfksuhuv", "google", "")
	if err != nil {
		t.Fatal(err)
	}

	rt, err := c.TokenConfig.GenerateToken(uid, time.Now().Add(1*time.Hour), token.REFRESH_TOKEN)
	if err != nil {
		t.Fatal(err)
	}

	err = c.Database.UpdateRefreshToken(t.Context(), uid, rt)
	if err != nil {
		t.Fatal(err)
	}

	_, _, err = c.RefreshToken(t.Context(), rt)
	if err != nil {
		t.Fatal(err)
	}
}
