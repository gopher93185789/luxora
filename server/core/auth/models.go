package auth

import (
	"github.com/gopher93185789/luxora/server/database"
	"github.com/gopher93185789/luxora/server/pkg/logger"
	"github.com/gopher93185789/luxora/server/pkg/token"
	"golang.org/x/oauth2"
)

type CoreAuthContext struct {
	GoogleConfig *oauth2.Config
	GithubConfig *oauth2.Config
	OauthState   string
	Database     database.Database
	TokenConfig  token.BstConfig
	Logger       *logger.Logger
}

type GithubUserDetails struct {
	Email            string `json:"email"`
	Login            string `json:"login"`
	ProviderID       int    `json:"id"`
	ProfileImageLink string `json:"avatar_url"`
}

type GoogleUserDetails struct {
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	ProviderID    string `json:"id"`
}
