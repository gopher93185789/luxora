package postgres

import "github.com/jackc/pgx/v5/pgxpool"

type Postgres struct {
	Pool *pgxpool.Pool
}
