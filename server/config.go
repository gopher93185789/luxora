package main

import (
	"fmt"
	"os"
)

const (
	DEV uint8 = iota
	PROD
)

type Config struct {
	Env                uint8
	Port               string
	DSN                string
	TlsCertFilePath    string
	TlsKeyFilePath     string
	GithubClient       string
	GithubSecret       string
	GithubRedirect     string
	GoogleClient       string
	GoogleSecret       string
	GoogleRedirect     string
	TokenEncryptionKey string
	TokenSigningKey    string
	ScalarPassword     string
	ScalarFilePath     string
}

func GetServerConfig() (*Config, error) {
	config := &Config{}

	envVars := map[string]*string{
		"PORT":                 &config.Port,
		"TLS_CERT_FILE_PATH":   &config.TlsCertFilePath,
		"TLS_KEY_FILE_PATH":    &config.TlsKeyFilePath,
		"DSN":                  &config.DSN,
		"GITHUB_CLIENT_ID":     &config.GithubClient,
		"GITHUB_CLIENT_SECRET": &config.GithubSecret,
		"GITHUB_REDIRECT_URL":  &config.GithubRedirect,
		"GOOGLE_CLIENT_ID":     &config.GoogleClient,
		"GOOGLE_CLIENT_SECRET": &config.GoogleSecret,
		"GOOGLE_REDIRECT_URL":  &config.GoogleRedirect,
		"TOKEN_ENCRYPTION_KEY": &config.TokenEncryptionKey,
		"TOKEN_SIGNING_KEY":    &config.TokenSigningKey,
		"SCALAR_PASSWORD":      &config.ScalarPassword,
		"SCALAR_FILEPATH":      &config.ScalarFilePath,
	}

	missingVars := []string{}

	for key, ref := range envVars {
		val := os.Getenv(key)
		if val == "" {
			missingVars = append(missingVars, key)
		} else {
			if key == "PORT" {
				*ref = ":" + val
			} else {
				*ref = val
			}
		}
	}

	if len(missingVars) > 0 {
		return nil, fmt.Errorf("missing environment variables: %v", missingVars)
	}

	if config.Port == ":443" {
		config.Env = PROD
	} else {
		config.Env = DEV
	}

	return config, nil
}
