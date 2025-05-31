package token

import (
	"errors"
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"time"
)

type BstConfig struct {
	SecretKey []byte // Secret used for signing JWTs
}

type TokenClaims struct {
	UserID    uuid.UUID `json:"user_id"`
	TokenType uint8     `json:"token_type"`
	Payload   string    `json:"payload,omitempty"`
	jwt.RegisteredClaims
}

// GenerateToken generates a standard JWT
func (b *BstConfig) GenerateToken(userID uuid.UUID, exp time.Time, tokenType uint8) (string, error) {
	claims := TokenClaims{
		UserID:    userID,
		TokenType: tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(exp),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(b.SecretKey)
}

// GenerateTokenWithPayload generates a JWT with additional payload
func (b *BstConfig) GenerateTokenWithPayload(userID uuid.UUID, exp time.Time, tokenType uint8, payload string) (string, error) {
	claims := TokenClaims{
		UserID:    userID,
		TokenType: tokenType,
		Payload:   payload,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(exp),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(b.SecretKey)
}

// VerifyToken verifies the token and returns the userID
func (b *BstConfig) VerifyToken(tokenStr string, tokenType uint8) (uuid.UUID, error) {
	claims, err := b.parseToken(tokenStr)
	if err != nil {
		return uuid.Nil, err
	}

	if claims.TokenType != tokenType {
		return uuid.Nil, errors.New("invalid token type")
	}

	return claims.UserID, nil
}

// VerifyTokenAndGetFields verifies the token and returns the full claims
func (b *BstConfig) VerifyTokenAndGetFields(tokenStr string, tokenType uint8) (*TokenClaims, error) {
	claims, err := b.parseToken(tokenStr)
	if err != nil {
		return nil, err
	}

	if claims.TokenType != tokenType {
		return nil, errors.New("invalid token type")
	}

	return claims, nil
}

// VerifyPayloadToken verifies a token and extracts payload
func (b *BstConfig) VerifyPayloadToken(tokenStr string, tokenType uint8) (uuid.UUID, string, error) {
	claims, err := b.parseToken(tokenStr)
	if err != nil {
		return uuid.Nil, "", err
	}

	if claims.TokenType != tokenType {
		return uuid.Nil, "", errors.New("invalid token type")
	}

	return claims.UserID, claims.Payload, nil
}

// parseToken parses and validates a JWT
func (b *BstConfig) parseToken(tokenStr string) (*TokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &TokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		return b.SecretKey, nil
	})

	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	claims, ok := token.Claims.(*TokenClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}

	return claims, nil
}
