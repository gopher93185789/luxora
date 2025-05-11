package token

import (
	"testing"
	"time"

	"github.com/arbol-labs/bst"
	"github.com/google/uuid"
)

func TestRoundTrip(t *testing.T) {
	var c = BstConfig{
		Config: bst.New([]byte("1234567891234567"), []byte("87987298729874987")),
	}

	uid := uuid.New()

	token, err := c.GenerateToken(uid, time.Now().Add(1*time.Hour), ACCESS_TOKEN)
	if err != nil {
		t.Fatal(err)
	}

	euid, err := c.VerifyToken(token, ACCESS_TOKEN)
	if err != nil {
		t.Fatal(err)
	}

	if uid.String() != euid.String() {
		t.Fatal("uuids dont match")
	}

}

func BenchmarkRoundTrip(b *testing.B) {
	var c = BstConfig{
		Config: bst.New([]byte("1234567891234567"), []byte("87987298729874987")),
	}

	uid := uuid.New()

	b.ResetTimer()

	for b.Loop() {
		token, err := c.GenerateToken(uid, time.Now().Add(1*time.Hour), ACCESS_TOKEN)
		if err != nil {
			b.Fatal(err)
		}

		_, err = c.VerifyToken(token, ACCESS_TOKEN)
		if err != nil {
			b.Fatal(err)
		}
	}
}