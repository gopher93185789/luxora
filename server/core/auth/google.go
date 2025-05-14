package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	tk "github.com/gopher93185789/luxora/server/pkg/token"
)

func (s *CoreAuthContext) handleGoogleOauthSignup(ctx context.Context, email, providerID string) (accessToken, refreshToken string, err error) {
	uid, err := s.Database.InsertOauthUser(ctx, "Anonymous"+uuid.New().String(), email, "github", providerID)
	if err != nil {
		return "", "", err
	}

	accessToken, err = s.TokenConfig.GenerateToken(uid, time.Now().Add(1*time.Hour), tk.ACCESS_TOKEN)
	if err != nil {
		return "", "", err
	}

	refreshToken, err = s.TokenConfig.GenerateToken(uid, time.Now().Add(720*time.Hour), tk.REFRESH_TOKEN)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, err
}

func (s *CoreAuthContext) HandleGoogleOauth(ctx context.Context, code string) (accessToken, refreshToken string, err error) {
	if code == "" {
		return "", "", fmt.Errorf("invalid exchange code")
	}

	token, err := s.GoogleConfig.Exchange(ctx, code)
	if err != nil {
		return "", "", err
	}

	client := s.GoogleConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	var user GoogleUserDetails
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return "", "", err
	}

	if !user.VerifiedEmail {
		return "", "", fmt.Errorf("user is not verified on google")
	}

	_, id, err := s.Database.GetIsUsernameAndIDByProviderID(ctx, user.Name)
	if err != nil {
		accessToken, refreshToken, err = s.handleGoogleOauthSignup(ctx, user.Email, user.ProviderID)
		return accessToken, refreshToken, nil
	}

	accessToken, err = s.TokenConfig.GenerateToken(id, time.Now().Add(1*time.Hour), tk.ACCESS_TOKEN)
	if err != nil {
		return "", "", err
	}

	refreshToken, err = s.TokenConfig.GenerateToken(id, time.Now().Add(720*time.Hour), tk.REFRESH_TOKEN)
	if err != nil {
		return "", "", err
	}

	s.Database.UpdateRefreshToken(ctx, id, refreshToken)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}
