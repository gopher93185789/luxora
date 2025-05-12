package token

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

func (b *BstConfig) GenerateToken(userID uuid.UUID, exp time.Time, tokenType uint8) (token string, err error) {
	return b.Config.GenerateCustomToken(Token{
		Exp:       exp,
		UserID:    userID,
		TokenType: tokenType,
	})
}

func (b *BstConfig) VerifyToken(token string, tokenType uint8) (userID uuid.UUID, err error) {
	var info Token
	err = b.Config.ParseToken(token, &info)
	if err != nil {
		return uuid.Nil, err
	}

	if info.TokenType != tokenType {
		return uuid.Nil, fmt.Errorf("invalid token type")
	}

	if time.Now().After(info.Exp) {
		return uuid.Nil, fmt.Errorf("token is expired")
	}

	return info.UserID, nil
}

func (b *BstConfig) GenerateTokenWithPayload(userID uuid.UUID, exp time.Time, tokenType uint8, payload string) (token string, err error) {
	return b.Config.GenerateCustomToken(VerificationToken{
		Exp:       exp,
		UserID:    userID,
		TokenType: tokenType,
		Payload:   payload,
	})
}

func (b *BstConfig) VerifyPayloadToken(token string, tokenType uint8) (userID uuid.UUID, payload string, err error) {
	var info VerificationToken
	err = b.Config.ParseToken(token, &info)
	if err != nil {
		return uuid.Nil, "", err
	}

	if info.TokenType != tokenType {
		return uuid.Nil, "", fmt.Errorf("invalid token type")
	}

	if time.Now().After(info.Exp) {
		return uuid.Nil, "", fmt.Errorf("token is expired")
	}

	return info.UserID, info.Payload, nil
}
