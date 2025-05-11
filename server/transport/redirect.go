package transport

import (
	"net/http"

	"golang.org/x/oauth2"
)

func (t *TransportConfig) GithubRedirect(w http.ResponseWriter, r *http.Request) {
	a := t.CoreAuth.GithubConfig.AuthCodeURL("", oauth2.AccessTypeOffline)
	http.Redirect(w, r, a, http.StatusPermanentRedirect)
}

func (t *TransportConfig) GoogleRedirect(w http.ResponseWriter, r *http.Request) {
	a := t.CoreAuth.GoogleConfig.AuthCodeURL("", oauth2.AccessTypeOffline)
	http.Redirect(w, r, a, http.StatusPermanentRedirect)
}