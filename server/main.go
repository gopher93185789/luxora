package main

import (
	"log"
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
	"golang.org/x/oauth2/google"
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
				ClientID:     config.GithubClient,
				ClientSecret: config.GithubSecret,
				Endpoint:     github.Endpoint,
				RedirectURL:  config.GithubRedirect,
				Scopes:       []string{"read:user"},
			},
			GoogleConfig: &oauth2.Config{
				ClientID:     config.GoogleClient,
				ClientSecret: config.GoogleSecret,
				Endpoint:     google.Endpoint,
				RedirectURL:  config.GoogleRedirect,
				Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email"},
			},
			TokenConfig: token.BstConfig{
				Config: bst.New([]byte("2345613455555555"), []byte(";iadufkvdfhkbvhkbfjv")),
			},
			Database: &postgres.Postgres{
				Pool: p,
			},
			OauthState: "w;iudfiuweiuvhw;hriujwiriwhre",
		},
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /ping", Ping)

	// auth
	mux.HandleFunc("GET /auth/github", tx.GithubRedirect)
	mux.HandleFunc("GET /auth/github/exchange", tx.GithubExchange)
	mux.HandleFunc("GET /auth/google", tx.GoogleRedirect)
	mux.HandleFunc("GET /auth/google/exchange", tx.GoogleExchange)


	log.Println("listening on port "+config.Port)
	if config.Env == DEV {
		panic(http.ListenAndServe(config.Port, mux))
	} else {
		panic(http.ListenAndServeTLS(config.Port, config.TlsCertFilePath, config.TlsKeyFilePath, mux))
	}
}
