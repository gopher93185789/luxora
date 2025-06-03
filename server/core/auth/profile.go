package auth

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/gopher93185789/luxora/server/pkg/models"
)

func (c *CoreAuthContext) GetUserInfo(ctx context.Context, userID uuid.UUID) (details models.UserDetails, err error) {
	details, err = c.Database.GetUserDetails(ctx, userID)
	if err != nil {
		c.Logger.Error(fmt.Sprintf("Failed to get user details: %v", err))
		return details, err
	}
	return details, nil
}

func (c *CoreAuthContext) Logout(ctx context.Context, userID uuid.UUID) (err error) {
	err = c.Database.UpdateRefreshToken(ctx, userID, "")
	if err != nil {
		c.Logger.Error(fmt.Sprintf("Failed to clear refresh token during logout: %v", err))
		return err
	}
	c.Logger.Info(fmt.Sprintf("Successfully logged out user: %s", userID))
	return nil
}
