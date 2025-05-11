package token

import (
	"time"

	"github.com/arbol-labs/bst"
	"github.com/google/uuid"
)

type Token struct {
	Exp       time.Time `json:"exp"`
	UserID    uuid.UUID `json:"uid"`
	TokenType uint8     `json:"tt"`
}

type BstConfig struct {
	Config *bst.Token
}

const (
	ACCESS_TOKEN uint8 = iota
	REFRESH_TOKEN
	PASSWORD_RECOVERY_TOKEN
	UPDATE_EMAIL_TOKEN
)

type VerificationToken struct {
	Exp       time.Time `json:"exp"`
	UserID    uuid.UUID `json:"uid"`
	TokenType uint8     `json:"tt"`
	Payload   string    `json:"p"`
}

