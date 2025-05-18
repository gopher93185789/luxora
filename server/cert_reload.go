package main

import (
	"crypto/tls"
	"log"
	"sync"
	"time"
)

type CertReloader struct {
	mu   sync.RWMutex
	cert *tls.Certificate
}

func NewCertReloader(certPath, keyPath string) (*CertReloader, error) {
	cert, err := tls.LoadX509KeyPair(certPath, keyPath)
	if err != nil {
		return nil, err
	}
	return &CertReloader{cert: &cert}, nil
}

func (cr *CertReloader) GetCertificate(*tls.ClientHelloInfo) (*tls.Certificate, error) {
	cr.mu.RLock()
	defer cr.mu.RUnlock()
	return cr.cert, nil
}

func (cr *CertReloader) WatchCertificate(certPath, keyPath string, interval time.Duration) {
	go func() {
		t := time.NewTicker(interval)

		<-t.C
		cert, err := tls.LoadX509KeyPair(certPath, keyPath)
		if err != nil {
			log.Printf("failed to reload cert: %v", err)
		} else {
			cr.mu.Lock()
			cr.cert = &cert
			cr.mu.Unlock()
			log.Println("TLS certificate reloaded")
		}

	}()
}
