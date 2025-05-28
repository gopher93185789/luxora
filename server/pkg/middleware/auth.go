package middleware

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	tk "github.com/gopher93185789/luxora/server/pkg/token"
)

type AuthMiddleWareConfig struct {
	auth *tk.BstConfig
}

type ValidTokenResponse struct {
	Expiry time.Time `json:"exp"`
}

func New(a *tk.BstConfig) *AuthMiddleWareConfig {
	return &AuthMiddleWareConfig{
		auth: a,
	}
}

func (a *AuthMiddleWareConfig) AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("Authorization")
		if len(token) == 0 {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		userID, err := a.auth.VerifyToken(token, tk.ACCESS_TOKEN)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		r.Header.Set("USERID", userID.String())
		next.ServeHTTP(w, r)
	}
}

func GetTokenFromRequest(r *http.Request) (userID uuid.UUID, err error) {
	uidstr := r.Header.Get("USERID")
	if uidstr == "" {
		return uuid.Nil, fmt.Errorf("failed to retrieve user ID from context")
	}

	uid, err := uuid.Parse(uidstr)
	if err != nil {
		return uuid.Nil, nil
	}

	return uid, nil
}

// @Summary      Verify access token
// @Description  Verifies the provided access token and returns its expiry if valid.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        token  query   string  true  "Access token to verify"
// @Success      200    {object} ValidTokenResponse "Token is valid and expiry is returned"
// @Failure      401    {string} string             "Unauthorized or invalid token"
// @Failure      500    {string} string             "Internal server error"
// @Router       /auth/verify [get]
func (a *AuthMiddleWareConfig) VerifyTokenEndpoint(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	fields, err := a.auth.VerifyTokenAndGetFields(token, tk.ACCESS_TOKEN)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if err := json.NewEncoder(w).Encode(ValidTokenResponse{Expiry: fields.Exp}); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}
