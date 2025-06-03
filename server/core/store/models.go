package store

import (
	"github.com/gopher93185789/luxora/server/database"
	"github.com/gopher93185789/luxora/server/pkg/logger"
)

type CoreStoreContext struct {
	Database database.Database
	Logger *logger.Logger

}
