package transport

import (
	"net/http"

	"golang.org/x/oauth2"
)

// @Summary      Github Oauth redirect
// @Description  redirect to Github for Oauth authentication.
// @Tags         auth
// @Accept       */*
// @Router       /auth/github [get]
func (t *TransportConfig) GithubRedirect(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	a := t.CoreAuth.GithubConfig.AuthCodeURL(t.CoreAuth.OauthState, oauth2.AccessTypeOffline)
	http.Redirect(w, r, a, http.StatusPermanentRedirect)
}

// @Summary      Google Oauth redirect
// @Description  redirect to Google for Oauth authentication.
// @Tags         auth
// @Accept       */*
// @Router       /auth/google [get]
func (t *TransportConfig) GoogleRedirect(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	a := t.CoreAuth.GoogleConfig.AuthCodeURL(t.CoreAuth.OauthState, oauth2.AccessTypeOffline)
	http.Redirect(w, r, a, http.StatusPermanentRedirect)
}
