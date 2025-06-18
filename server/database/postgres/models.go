package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Postgres struct {
	Pool *pgxpool.Pool
}

func New(dsn string) (pool *Postgres, err error) {
	conf, err := pgxpool.New(context.TODO(), dsn)
	if err != nil {
		return nil, err
	}

	err = conf.Ping(context.Background())
	if err != nil {
		return nil, err
	}

	return &Postgres{Pool: conf}, nil
}
