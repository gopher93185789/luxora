package postgres

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Postgres struct {
	Pool *pgxpool.Pool
}

func New(dsn string) (pool *Postgres, err error) {
	conf, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, err
	}


	conf.MaxConns = 50
	conf.MinConns = 10
	conf.MaxConnLifetime = 15 * time.Minute
	conf.MaxConnIdleTime = 30 * time.Second
	conf.HealthCheckPeriod = 30 * time.Second
	conf.ConnConfig.ConnectTimeout = 5 * time.Second

	p, err := pgxpool.NewWithConfig(context.Background(), conf)
	if err != nil {
		return nil, err
	}

	err = p.Ping(context.Background())
	if err != nil {
		return nil, err
	}

	return &Postgres{Pool: p}, nil
}
