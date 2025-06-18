package main

import (
	"fmt"
	"log"
	"net/http"
	"time"
)

func main() {
	url := "https://api.luxoras.nl/listings?limit=12&page=1"
	token := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiOGI0YzdjNWYtYjk0OC00MjBlLWJlNTctN2M3ZTA3MjYzYWY0IiwidG9rZW5fdHlwZSI6MCwiZXhwIjoxNzUwMjc4MDU5fQ.Jj8cfgF7Xmop7FpAPHpQyFKmPEq_gMWv_Br8gUJ_9ik"


	counter := 1

	for {
		fmt.Printf("Request #%d\n", counter)

		start := time.Now()

		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			log.Fatalf("Failed to create request: %v", err)
		}
		req.Header.Set("Authorization", token)
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			log.Printf("Request error: %v", err)
			break
		}

		duration := time.Since(start)
		fmt.Printf("Response time: %v\n", duration)

		if duration > 10*time.Second {
			fmt.Println("Response took longer than 10 seconds. Stopping.")
			break
		}

		fmt.Printf("Status: %s\n", resp.Status)
		counter++
	}
}
