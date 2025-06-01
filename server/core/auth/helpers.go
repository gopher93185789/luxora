package auth

import (
	"time"

	"github.com/google/uuid"
	"github.com/gopher93185789/luxora/server/pkg/token"
)

func (s *CoreAuthContext) generateTokens(userID uuid.UUID) (accessToken, refreshToken string, err error) {
	accessToken, err = s.TokenConfig.GenerateToken(userID, time.Now().Add(1*time.Hour), token.ACCESS_TOKEN)
	if err != nil {
		return "", "", err
	}

	refreshToken, err = s.TokenConfig.GenerateToken(userID, time.Now().Add(720*time.Hour), token.REFRESH_TOKEN)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}
