package main

import (
	"crypto/sha256"
	"crypto/tls"
	"io"
	"log"
	"os"
	"slices"
	"sync"
	"time"
)

type CertReloader struct {
	mu           sync.RWMutex
	cert         *tls.Certificate
	CertFileHash []byte
	KeyFileHash  []byte
}

func NewCertReloader(certPath, keyPath string) (*CertReloader, error) {
	cert, err := tls.LoadX509KeyPair(certPath, keyPath)
	if err != nil {
		return nil, err
	}

	ch, err := generateFileHash(certPath)
	if err != nil {
		return nil, err
	}
	kh, err := generateFileHash(keyPath)
	if err != nil {
		return nil, err
	}
	return &CertReloader{cert: &cert, CertFileHash: ch, KeyFileHash: kh}, nil
}

func (cr *CertReloader) GetCertificate(*tls.ClientHelloInfo) (*tls.Certificate, error) {
	cr.mu.RLock()
	defer cr.mu.RUnlock()
	return cr.cert, nil
}

func generateFileHash(filePath string) (hash []byte, err error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	hasher := sha256.New()

	if _, err := io.Copy(hasher, file); err != nil {
		return nil, err
	}

	return hasher.Sum(nil), nil

}

func (cr *CertReloader) WatchCertificate(certPath, keyPath string, interval time.Duration) {
	go func() {
		t := time.NewTicker(interval)

        for range t.C {
            ch, err := generateFileHash(certPath)
			if err != nil {
				continue
			}

			kh, err := generateFileHash(keyPath)
			if err != nil {
				continue
			}

			if slices.Compare(ch, cr.CertFileHash) == 0 && slices.Compare(kh, cr.KeyFileHash) == 0 {
				continue
			}

			cert, err := tls.LoadX509KeyPair(certPath, keyPath)
			if err != nil {
				log.Printf("failed to reload cert: %v", err)
				continue
			}

			cr.mu.Lock()
            cr.CertFileHash = ch
            cr.KeyFileHash = kh
			cr.cert = &cert
			cr.mu.Unlock()
			log.Println("TLS certificate reloaded")
        }
	}()
}
