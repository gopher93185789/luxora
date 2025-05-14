package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	tk "github.com/gopher93185789/luxora/server/pkg/token"
)

func (s *CoreAuthContext) handleOauthSignup(ctx context.Context, username, email, providerID string) (accessToken, refreshToken string, err error) {
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

func (s *CoreAuthContext) HandleGithubOauth(ctx context.Context, code string) (accessToken, refreshToken string, err error) {
	if code == "" {
		return "", "", fmt.Errorf("invalid exchange code")
	}

	token, err := s.GithubConfig.Exchange(ctx, code)
	if err != nil {
		return "", "", err
	}

	client := s.GithubConfig.Client(context.Background(), token)
	resp, err := client.Get("https://api.github.com/user")
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	var user GithubUserDetails
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return "", "", err
	}

	pidn := strconv.Itoa(user.ProviderID)

	id, pid, err := s.Database.GetOauthUserIdByUsername(ctx, user.Login)
	if err != nil {
		accessToken, refreshToken, err = s.handleOauthSignup(ctx, user.Login, user.Email, pidn)
		return accessToken, refreshToken, nil
	}

	if pidn != pid {
		return "", "", fmt.Errorf("provider ids dont match")
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
