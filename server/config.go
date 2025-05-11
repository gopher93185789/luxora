package main

import (
	"fmt"
	"os"
)

const (
	DEV = iota
	PROD
)

type Config struct {
	Env uint
	Port string
	DSN string
	TlsCertFilePath string
	TlsKeyFilePath string
	GithubClient string
	GithubSecret string
	GithubRedirect string
}

func GetServerConfig() (config *Config, err error) {
	config = &Config{}
	portEnv := os.Getenv("PORT")
	if portEnv == "" {
		return nil, fmt.Errorf("missing 'PORT' env variable")
	}
	config.Port = ":"+portEnv

	if portEnv == "443" {
		config.Env = PROD
	}else{
		config.Env = DEV
	}

	config.TlsCertFilePath = os.Getenv("TLS_CERT_FILE_PATH")
	config.TlsKeyFilePath = os.Getenv("TLS_KEY_FILE_PATH")
	config.DSN = os.Getenv("DSN")


	config.GithubClient = os.Getenv("GITHUB_CLIENT_ID")
	config.GithubSecret = os.Getenv("GITHUB_CLIENT_SECRET")
	config.GithubRedirect = os.Getenv("GITHUB_REDIRECT_URL")

	if config.GithubRedirect == "" || config.GithubClient == "" || config.GithubSecret == "" {
		return nil, fmt.Errorf("missing or invalid github oauth env variables (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REDIRECT_URL)")
	}

	if config.TlsCertFilePath == "" || config.TlsKeyFilePath == "" {
		return nil, fmt.Errorf("invalid tls file paths")
	}

	return config, nil
}