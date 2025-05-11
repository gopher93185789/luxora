package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	tk "github.com/gopher93185789/luxora/server/pkg/token"
)

func (s *CoreAppContext) handleOauthSignup(ctx context.Context, username, email, providerID string) (accessToken, refreshToken string, err error) {
	if len(username) == 0 {
		return "", "", fmt.Errorf("invalid username")
	}

	uid, err := s.Database.InsertOauthUser(ctx, username, email, "github", providerID)
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

func (s *CoreAppContext) handleOauthLogin(ctx context.Context, username string, providerId string) (accessToken, refreshToken string, err error) {
	uid, pid, err := s.Database.GetOauthUserIdByUsername(ctx, username)
	if err != nil && !strings.Contains(err.Error(), "") {
		return "", "", err
	}

	if providerId != pid {
		return "", "", fmt.Errorf("provider ids dont match")
	}

	accessToken, err = s.TokenConfig.GenerateToken(uid, time.Now().Add(1*time.Hour), tk.ACCESS_TOKEN)
	if err != nil {
		return "", "", err
	}

	refreshToken, err = s.TokenConfig.GenerateToken(uid, time.Now().Add(720*time.Hour), tk.REFRESH_TOKEN)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, s.Database.SetRefreshToken(ctx, uid, refreshToken)
}

func (s *CoreAppContext) HandleGithubOauth(ctx context.Context, code string) (accessToken, refreshToken string, err error) {
	token, err := s.Github.Exchange(ctx, code)
	if err != nil {
		return "", "", err
	}

	client := s.Github.Client(context.Background(), token)
	resp, err := client.Get("https://api.github.com/user")
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	var user GithubUserDetails
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return "", "", err
	}

	if !s.DB.UserExists(ctx, user.Login) {
		accessToken, refreshToken, err = s.handleOauthSignup(ctx, user.Login, user.Email)
	} else {
		accessToken, refreshToken, err = s.handleOauthLogin(ctx, user.Login)
	}

	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}