package error

import (
	"encoding/json"
	"net/http"
)

type ErrorResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func ErrorWithJson(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-type", "application/json")
	w.WriteHeader(code)
	if err := json.NewEncoder(w).Encode(ErrorResponse{Code: code, Message: message}); err != nil {
		w.Write([]byte(message))
		return
	}
}
