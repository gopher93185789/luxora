package docs

import (
	"fmt"
	"net/http"

	"github.com/MarceloPetrucio/go-scalar-api-reference"
)

type ScalarRoute struct {
	Password string
	FilePath string
}

func (s *ScalarRoute) RegisterScalarDocs(w http.ResponseWriter, r * http.Request) {
	password := r.URL.Query().Get("password")

	if password != s.Password {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	htmlContent, err := scalar.ApiReferenceHTML(&scalar.Options{
		SpecURL: s.FilePath, 
		CustomOptions: scalar.CustomOptions{
			PageTitle: "Luxora API",
		},
		DarkMode: true,
	})

	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	fmt.Fprintln(w, htmlContent)
}