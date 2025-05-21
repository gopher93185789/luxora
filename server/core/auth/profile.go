package auth

import (
	"context"

	"github.com/google/uuid"
	"github.com/gopher93185789/luxora/server/pkg/models"
)

func (c *CoreAuthContext) GetUserInfo(ctx context.Context, userID uuid.UUID) (details models.UserDetails, err error) {
	return c.Database.GetUserDetails(ctx, userID)
}
