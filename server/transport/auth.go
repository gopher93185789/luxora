package transport

import (
	"encoding/json"

	errs "github.com/gopher93185789/luxora/server/pkg/error"
	"github.com/gopher93185789/luxora/server/pkg/middleware"

	"net/http"
	"time"
)

// @Summary		Github Oauth exchange
// @Description	Send a request to this endpoint to exchange the Github code you got from Github for an access token.
// @Tags			auth
// @Accept			*/*
// @Produce		json
// @Success		200	{object}	AccessTokenResponse	"Access token response"
// @Failure		401	{object}	errs.ErrorResponse	"Unauthorized error"
// @Failure		500	{object}	errs.ErrorResponse	"Internal server error"
// @Router			/auth/github/exchange [get]
// @Param			code	query	string	true	"code"	Format(code)
// @Param			state	query	string	true	"state"	Format(state)
func (t *TransportConfig) GithubExchange(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
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

// @Summary		Google Oauth exchange
// @Description	Send a request to this endpoint to exchange the Google code you got from Google for an access token.
// @Tags			auth
// @Accept			*/*
// @Produce		json
// @Success		200	{object}	AccessTokenResponse	"Access token response"
// @Failure		401	{object}	errs.ErrorResponse	"Unauthorized error"
// @Failure		500	{object}	errs.ErrorResponse	"Internal server error"
// @Router			/auth/github/exchange [get]
// @Param			code	query	string	true	"code"	Format(code)
// @Param			state	query	string	true	"state"	Format(state)
func (t *TransportConfig) GoogleExchange(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")
	if state != t.CoreAuth.OauthState {
		errs.ErrorWithJson(w, http.StatusUnauthorized, "Mismatched state")
		return
	}

	at, rt, err := t.CoreAuth.HandleGoogleOauth(r.Context(), code)
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

// @Summary		Refresh Token
// @Description	Refresh the access token using the refresh token stored in the cookie.
// @Tags			auth
// @Accept			*/*
// @Produce		json
// @Success		200	{object}	AccessTokenResponse	"Access token response"
// @Failure		400	{object}	errs.ErrorResponse	"Missing cookie error"
// @Failure		401	{object}	errs.ErrorResponse	"Unauthorized error"
// @Failure		500	{object}	errs.ErrorResponse	"Internal server error"
// @Router			/auth/refresh [post]
func (t *TransportConfig) RefreshToken(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	cookie, err := r.Cookie("LUXORA_REFRESH_TOKEN")
	if err != nil {
		errs.ErrorWithJson(w, http.StatusBadRequest, "missing cookie")
		return
	}

	at, rt, err := t.CoreAuth.RefreshToken(r.Context(), cookie.Value)
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

// @Summary      Get user info
// @Description  Retrieves the authenticated user's profile information.
// @Tags         auth
// @Accept       */*
// @Produce      json
// @Param        Authorization  header  string  true  "Access token"
// @Success      200  {object}  models.UserDetails "User profile details"
// @Failure      401  {object}  errs.ErrorResponse  "Unauthorized error"
// @Failure      500  {object}  errs.ErrorResponse  "Internal server error"
// @Router       /auth/userinfo [get]
func (t *TransportConfig) GetUserInfo(w http.ResponseWriter, r *http.Request) {
	uid, err := middleware.GetTokenFromRequest(r)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to get user id from 'Authorization' header")
		return
	}

	details, err := t.CoreAuth.GetUserInfo(r.Context(), uid)
	if err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to get user details: "+err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(details); err != nil {
		errs.ErrorWithJson(w, http.StatusInternalServerError, "failed to encode product id: "+err.Error())
		return
	}
}
