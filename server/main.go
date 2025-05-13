package main

import (
	"log"
	"net/http"

	"github.com/arbol-labs/bst"
	coreAuth "github.com/gopher93185789/luxora/server/core/auth"
	"github.com/gopher93185789/luxora/server/database/postgres"
	"github.com/gopher93185789/luxora/server/pkg/middleware"
	"github.com/gopher93185789/luxora/server/pkg/token"
	auth "github.com/gopher93185789/luxora/server/transport"
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
	config, err := GetServerConfig()
	if err != nil {
		log.Fatalln("error in config: " + err.Error())
	}

	pool, err := postgres.New(config.DSN)
	if err != nil {
		log.Fatalln("Failed to connect to database: " + err.Error())
	}

	tokenConf := bst.New([]byte(config.TokenEncryptionKey), []byte(config.TokenSigningKey))

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
				Config: tokenConf,
			},
			Database:   pool,
			OauthState: "w;iudfiuweiuvhw;hriujwiriwhre",
		},
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /ping", Ping)

	mcf := middleware.New(&token.BstConfig{Config: tokenConf})

	// auth
	mux.HandleFunc("GET /auth/github", tx.GithubRedirect)
	mux.HandleFunc("GET /auth/github/exchange", tx.GithubExchange)
	mux.HandleFunc("GET /auth/google", tx.GoogleRedirect)
	mux.HandleFunc("GET /auth/google/exchange", tx.GoogleExchange)
	mux.HandleFunc("POST /auth/refresh", tx.RefreshToken)

	// listings
	mux.HandleFunc("POST /listings", mcf.AuthMiddleware(tx.CreateNewListing))
	mux.HandleFunc("DELETE /listings", mcf.AuthMiddleware(tx.DeleteListing))

	log.Println("listening on port " + config.Port)
	if config.Env == DEV {
		log.Fatalln(http.ListenAndServe(config.Port, mux))
	} else {
		log.Fatalln(http.ListenAndServeTLS(config.Port, config.TlsCertFilePath, config.TlsKeyFilePath, mux))
	}
}
