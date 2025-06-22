package auth

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
)

func (s *CoreAuthContext) handleGoogleOauthSignup(ctx context.Context, providerID, profileImageLink string) (accessToken, refreshToken string, err error) {
	uid, err := s.Database.InsertOauthUser(ctx, "Anonymous"+uuid.New().String(), "google", providerID, profileImageLink)
	if err != nil {
		s.Logger.Error(fmt.Sprintf("Failed to insert Google OAuth user: %v", err))
		return "", "", err
	}

	accessToken, refreshToken, err = s.generateTokens(uid)
	if err != nil {
		s.Logger.Error(fmt.Sprintf("Failed to generate tokens: %v", err))
		return "", "", err
	}

	err = s.Database.UpdateRefreshToken(ctx, uid, refreshToken)
	if err != nil {
		s.Logger.Error(fmt.Sprintf("Failed to update refresh token: %v", err))
		return "", "", err
	}

	s.Logger.Info(fmt.Sprintf("Successfully completed Google OAuth signup for user: %s", uid))
	return accessToken, refreshToken, err
}

func (s *CoreAuthContext) HandleGoogleOauth(ctx context.Context, code string) (accessToken, refreshToken string, err error) {
	if code == "" {
		return "", "", fmt.Errorf("invalid exchange code")
	}

	token, err := s.GoogleConfig.Exchange(ctx, code)
	if err != nil {
		s.Logger.Error(fmt.Sprintf("Google token exchange failed: %v", err))
		return "", "", err
	}

	client := s.GoogleConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		s.Logger.Error(fmt.Sprintf("Failed to fetch Google user details: %v", err))
		return "", "", err
	}
	defer resp.Body.Close()

	var user GoogleUserDetails
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		s.Logger.Error(fmt.Sprintf("Failed to decode Google user details: %v", err))
		return "", "", err
	}

	if !user.VerifiedEmail {
		s.Logger.Error(fmt.Sprintf("User email not verified on Google: %s", user.Email))
		return "", "", fmt.Errorf("user is not verified on google")
	}

	s.Logger.Debug(fmt.Sprintf("Looking up user with Google ID: %s", user.ProviderID))
	_, id, err := s.Database.GetIsUsernameAndIDByProviderID(ctx, user.ProviderID)
	if err != nil {
		s.Logger.Info("User not found, starting Google OAuth signup flow")
		accessToken, refreshToken, err = s.handleGoogleOauthSignup(ctx, user.ProviderID, user.Picture)
		if err != nil {
			return "", "", err
		}

		return accessToken, refreshToken, nil
	}

	s.Logger.Debug(fmt.Sprintf("Generating new tokens for existing user: %s", id))
	accessToken, refreshToken, err = s.generateTokens(id)
	if err != nil {
		s.Logger.Error(fmt.Sprintf("Failed to generate tokens: %v", err))
		return "", "", err
	}

	err = s.Database.UpdateRefreshToken(ctx, id, refreshToken)
	if err != nil {
		s.Logger.Error(fmt.Sprintf("Failed to update refresh token: %v", err))
		return "", "", err
	}

	s.Logger.Info(fmt.Sprintf("Successfully completed Google OAuth flow for user ID: %s", id))
	return accessToken, refreshToken, nil
}
