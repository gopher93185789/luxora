package auth

import (
	"context"
	"fmt"

	tk "github.com/gopher93185789/luxora/server/pkg/token"
)

func (s *CoreAuthContext) RefreshToken(ctx context.Context, token string) (accessToken, refreshToken string, err error) {
	if token == "" {
		return "", "", fmt.Errorf("no token provided")
	}


	userid, err := s.TokenConfig.VerifyToken(token, tk.REFRESH_TOKEN)
	if err != nil {
		s.Logger.Error(fmt.Sprintf("Token verification failed: %v", err))
		return "", "", err
	}

	dbtoken, err := s.Database.GetRefreshToken(ctx, userid)
	if err != nil {
		s.Logger.Error(fmt.Sprintf("Failed to get refresh token from database: %v", err))
		return "", "", err
	}

	if token != dbtoken {
		return "", "", fmt.Errorf("tokens dont match")
	}

	accessToken, refreshToken, err = s.generateTokens(userid)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate tokens")
	}

	err = s.Database.UpdateRefreshToken(ctx, userid, refreshToken)
	if err != nil {
		s.Logger.Error(fmt.Sprintf("Failed to update refresh token in database: %v", err))
		return "", "", err
	}

	s.Logger.Info(fmt.Sprintf("Successfully refreshed tokens for user: %s", userid))
	return
}
