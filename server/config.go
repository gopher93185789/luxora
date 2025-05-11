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


	if config.TlsCertFilePath == "" || config.TlsKeyFilePath == "" {
		return nil, fmt.Errorf("invalid tls file paths")
	}

	return config, nil
}