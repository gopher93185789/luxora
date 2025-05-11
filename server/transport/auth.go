package transport

import (
	"encoding/json"

	errs "github.com/gopher93185789/luxora/server/pkg/error"

	"net/http"
	"time"
)

// @Summary      Github Oauth exchange
// @Description  Send a request to this endpoint to exchange the Github code you got from Github for an access token.
// @Tags         auth
// @Accept       */*
// @Produce      json
// @Success      200  {object}  AccessTokenResponse  "Access token response"
// @Failure      401  {object}  errs.ErrorResponse "Unauthorized error"
// @Failure      500  {object}  errs.ErrorResponse "Internal server error"
// @Router       /auth/github/exchange [get]
// @Param        code  query  string  true  "code"  Format(code)
func (t *TransportConfig) GithubExchange(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	at, rt, err := t.CoreAuth.HandleGithubOauth(r.Context(), code)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusUnauthorized, err.Error())
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:  "LUXORA_REFRESH_TOKEN",
		Value: rt,
		Path:  "/",
		// Domain: "app-omain",
		Expires:  time.Now().Add(720 * time.Hour),
		HttpOnly: true,
	})

	if err := json.NewEncoder(w).Encode(AccessTokenResponse{AccessToken: at}); err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to encode access token")
		return
	}
}
