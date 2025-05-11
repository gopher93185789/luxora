package main

import "net/http"


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
		panic("error in config: " + err.Error())
	}
	
	mux := http.NewServeMux()
	mux.HandleFunc("GET /ping", Ping)

	if config.Env == DEV {
		panic(http.ListenAndServe(config.Port, mux))
	}else {
		panic(http.ListenAndServeTLS(config.Port, config.TlsCertFilePath, config.TlsKeyFilePath, mux))

	}

}