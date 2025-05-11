package transport

import (
	"github.com/gopher93185789/luxora/server/core/auth"
)

type TransportConfig struct {
	CoreAuth *auth.CoreAuthContext 
}

type AccessTokenResponse struct {
	AccessToken string `json:"access_token"`
}