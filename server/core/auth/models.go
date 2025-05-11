package auth

import (
	"github.com/gopher93185789/luxora/server/database"
	"github.com/gopher93185789/luxora/server/pkg/token"
	"golang.org/x/oauth2"
)

type CoreAuthContext struct {
	GoogleConfig *oauth2.Config
	GithubConfig *oauth2.Config
	Database database.Database
	TokenConfig token.BstConfig
}

type GithubUserDetails struct {
	Email string `json:"email"`
	Login string `json:"login"`
	ProviderID int `json:"id"`
}