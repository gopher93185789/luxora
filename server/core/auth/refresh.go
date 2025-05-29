package auth

import (
	"context"
	"fmt"
	"time"

	tk "github.com/gopher93185789/luxora/server/pkg/token"
)

func (s *CoreAuthContext) RefreshToken(ctx context.Context, token string) (accessToken, refreshToken string, err error) {
	if token == "" {
		return "", "", fmt.Errorf("no token provided")
	}

	userid, err := s.TokenConfig.VerifyToken(token, tk.REFRESH_TOKEN)
	if err != nil {
		return "", "", err
	}

	dbtoken, err := s.Database.GetRefreshToken(ctx, userid)
	if err != nil {
		return "", "", err
	}

	if token != dbtoken {
		return "", "", fmt.Errorf("tokens dont match")
	}

	accessToken, err = s.TokenConfig.GenerateToken(userid, time.Now().Add(1*time.Hour), tk.ACCESS_TOKEN)
	if err != nil {
		return "", "", err
	}

	refreshToken, err = s.TokenConfig.GenerateToken(userid, time.Now().Add(720*time.Hour), tk.REFRESH_TOKEN)
	if err != nil {
		return "", "", err
	}

	err = s.Database.UpdateRefreshToken(ctx,userid, refreshToken)
	if err != nil {
		return "", "", err
	}

	return
}
