package main

import (
	"net/http"

	"github.com/arbol-labs/bst"
	coreAuth "github.com/gopher93185789/luxora/server/core/auth"
	"github.com/gopher93185789/luxora/server/database/postgres"
	"github.com/gopher93185789/luxora/server/pkg/testutils"
	"github.com/gopher93185789/luxora/server/pkg/token"
	auth "github.com/gopher93185789/luxora/server/transport"
	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
)

// @Summary      Healthcheck
// @Description  Endpoint to check if the server is running
// @Tags         base
// @Accept       */*
// @Produce      plain
// @Success      200  {string}  string  "pong"
// @Router       /ping [get]
func Ping(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("pong"))
}

func main() {
	godotenv.Load(".env")
	config, err := GetServerConfig()
	if err != nil {
		panic("error in config: " + err.Error())
	}

	p, clean, err := testutils.SetupTestPostgresDB("")
	if err != nil {
		panic(err)
	}
	defer clean()

	tx := &auth.TransportConfig{
		CoreAuth: &coreAuth.CoreAuthContext{
			GithubConfig: &oauth2.Config{
				ClientID:     "Ov23liW6P1CMiQ7QYheo",
				ClientSecret: "e893637b7c600bd9570183f5d7dc282d6cf4f8bd",
				Endpoint:     github.Endpoint,
				RedirectURL:  "http://localhost:8080/auth/github/exchange",
				Scopes:       []string{"read:user"},
			},
			TokenConfig: token.BstConfig{
				Config: bst.New([]byte("2345613455555555"), []byte(";iadufkvdfhkbvhkbfjv")),
			},
			Database: &postgres.Postgres{
				Pool: p,
			},
		},
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /ping", Ping)

	mux.HandleFunc("GET /auth/github", tx.GithubRedirect)
	mux.HandleFunc("GET /auth/github/exchange", tx.GithubExchange)

	
	if config.Env == DEV {
		panic(http.ListenAndServe(config.Port, mux))
	} else {
		panic(http.ListenAndServeTLS(config.Port, config.TlsCertFilePath, config.TlsKeyFilePath, mux))
	}
}
