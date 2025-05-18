package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/arbol-labs/bst"
	coreAuth "github.com/gopher93185789/luxora/server/core/auth"
	"github.com/gopher93185789/luxora/server/database/postgres"
	"github.com/gopher93185789/luxora/server/pkg/middleware"
	"github.com/gopher93185789/luxora/server/pkg/token"
	auth "github.com/gopher93185789/luxora/server/transport"
	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"
)

// @Summary		Healthcheck
// @Description	Endpoint to check if the server is running
// @Tags			base
// @Accept			*/*
// @Produce		plain
// @Success		200	{string}	string	"pong"
// @Router			/ping [get]
func Ping(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("pong"))
}

//	@title			Luxora Marketplace API
//	@version		0.8.0
//	@description	Luxora is a secure, modern backend API for managing listings, bids, and authentication with OAuth2 providers. This API powers the Luxora marketplace platform, enabling seamless user authentication, listing management, and bidding workflows.

//	@host	api.luxoras.nl

// @schemes	https
func main() {
	godotenv.Load("../.env")
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
	mux.HandleFunc("POST /listing/bid", mcf.AuthMiddleware(tx.CreateBid))
	mux.HandleFunc("POST /listings", mcf.AuthMiddleware(tx.CreateNewListing))
	mux.HandleFunc("GET /listings", mcf.AuthMiddleware(tx.GetListings))
	mux.HandleFunc("DELETE /listings", mcf.AuthMiddleware(tx.DeleteListing))
	mux.HandleFunc("GET /listings/highest-bid", mcf.AuthMiddleware(tx.GetHighestBid))
	mux.HandleFunc("GET /listings/bids", mcf.AuthMiddleware(tx.GetBids))
	mux.HandleFunc("PUT /listings/sold/bid", mcf.AuthMiddleware(tx.UpdateSoldViaBid))

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)

	srv := http.Server{
		Addr:    config.Port,
		Handler: mux,
	}

	go func() {
		log.Println("listening on port " + config.Port)
		if config.Env == DEV {
			if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
				log.Printf("failed to start server: %v", err)
			}
		} else {
			if err := srv.ListenAndServeTLS(config.TlsCertFilePath, config.TlsKeyFilePath); err != nil && !errors.Is(err, http.ErrServerClosed) {
				log.Printf("failed to start server: %v", err)
			}
		}
	}()

	<-sig
	fmt.Println("shutdown signal received")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		fmt.Println("failed to shutdown server: " + err.Error())
	} else {
		fmt.Println("shutdown server")
	}
}
