package auth

import (
	"github.com/gopher93185789/luxora/server/database"
	"golang.org/x/oauth2"
)

type CoreAuthService struct {
	GoogleConfig *oauth2.Config
	GithubConfig *oauth2.Config
	Database database.Database
}