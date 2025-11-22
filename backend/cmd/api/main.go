package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	godotenv.Load()

	// Initialize router
	router := mux.NewRouter()

	// Health check
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy"}`))
	}).Methods("GET")

	// API routes
	api := router.PathPrefix("/api/v1").Subrouter()
	
	// Routes will be added here
	api.HandleFunc("/auth/register", nil).Methods("POST")
	api.HandleFunc("/auth/login", nil).Methods("POST")
	api.HandleFunc("/upload", nil).Methods("POST")
	api.HandleFunc("/process", nil).Methods("POST")
	api.HandleFunc("/study/{id}", nil).Methods("GET")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
