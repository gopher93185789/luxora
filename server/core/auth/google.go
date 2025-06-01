package auth

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
)

func (s *CoreAuthContext) handleGoogleOauthSignup(ctx context.Context, providerID, profileImageLink string) (accessToken, refreshToken string, err error) {
	uid, err := s.Database.InsertOauthUser(ctx, "Anonymous"+uuid.New().String(), "github", providerID, profileImageLink)
	if err != nil {
		return "", "", err
	}

	accessToken, refreshToken, err = s.generateTokens(uid)
	if err != nil {
		return "", "", err
	}

	err = s.Database.UpdateRefreshToken(ctx, uid, refreshToken)
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

	_, id, err := s.Database.GetIsUsernameAndIDByProviderID(ctx, user.ProviderID)
	if err != nil {
		accessToken, refreshToken, err = s.handleGoogleOauthSignup(ctx, user.ProviderID, user.Picture)
		if err != nil {
			return "", "", err
		}

		return accessToken, refreshToken, nil
	}

	accessToken, refreshToken, err = s.generateTokens(id)
	if err != nil {
		return "", "", err
	}

	err = s.Database.UpdateRefreshToken(ctx, id, refreshToken)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}
