package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
)

func (s *CoreAuthContext) handleOauthSignup(ctx context.Context, username, providerID, profileImageLink string) (accessToken, refreshToken string, err error) {
	if len(username) == 0 {
		return "", "", fmt.Errorf("invalid username")
	}

	uid, err := s.Database.InsertOauthUser(ctx, username, "github", providerID, profileImageLink)
	if err != nil {
		s.Logger.Error(fmt.Sprintf("Failed to insert OAuth user: %v", err))
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

	s.Logger.Info(fmt.Sprintf("Successfully completed OAuth signup for user: %s", username))
	return accessToken, refreshToken, err
}

func (s *CoreAuthContext) HandleGithubOauth(ctx context.Context, code string) (accessToken, refreshToken string, err error) {
	if code == "" {
		return "", "", fmt.Errorf("invalid exchange code")
	}

	token, err := s.GithubConfig.Exchange(ctx, code)
	if err != nil {
		s.Logger.Error(fmt.Sprintf("GitHub token exchange failed: %v", err))
		return "", "", err
	}

	client := s.GithubConfig.Client(context.Background(), token)
	resp, err := client.Get("https://api.github.com/user")
	if err != nil {
		s.Logger.Error(fmt.Sprintf("Failed to fetch GitHub user details: %v", err))
		return "", "", err
	}
	defer resp.Body.Close()

	var user GithubUserDetails
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		s.Logger.Error(fmt.Sprintf("Failed to decode GitHub user details: %v", err))
		return "", "", err
	}

	pidn := strconv.Itoa(user.ProviderID)
	s.Logger.Debug(fmt.Sprintf("Looking up user with GitHub ID: %s", pidn))

	id, err := s.Database.GetOauthUserIdByProviderID(ctx, pidn)
	if err != nil {
		s.Logger.Info(fmt.Sprintf("User not found, starting OAuth signup flow for GitHub user: %s", user.Login))
		accessToken, refreshToken, err = s.handleOauthSignup(ctx, user.Login, pidn, user.ProfileImageLink)
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

	s.Logger.Info(fmt.Sprintf("Successfully completed GitHub OAuth flow for user ID: %s", id))
	return accessToken, refreshToken, nil
}
