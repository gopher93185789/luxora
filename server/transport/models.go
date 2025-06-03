package transport

import (
	"github.com/google/uuid"
	"github.com/gopher93185789/luxora/server/core/auth"
	"github.com/gopher93185789/luxora/server/core/store"
	"github.com/gopher93185789/luxora/server/pkg/logger"
	"github.com/gopher93185789/luxora/server/pkg/middleware"
)

type TransportConfig struct {
	CoreAuth   *auth.CoreAuthContext
	CoreStore  *store.CoreStoreContext
	Middleware *middleware.AuthMiddleWareConfig
	Logger *logger.Logger
}

type AccessTokenResponse struct {
	AccessToken string `json:"access_token"`
}

type CreateListingResponse struct {
	ProductID uuid.UUID `json:"product_id"`
}
