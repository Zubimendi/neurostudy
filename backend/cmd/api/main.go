package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"github.com/Zubimendi/neurostudy/internal/database"
	"github.com/Zubimendi/neurostudy/internal/auth"
	"github.com/Zubimendi/neurostudy/internal/handlers"
	"github.com/Zubimendi/neurostudy/internal/middleware"
	"github.com/Zubimendi/neurostudy/pkg/cloudinary"
)

func main() {
	// Load environment variables
	envPaths := []string{"../.env", ".env", "../../.env"}
	envLoaded := false
	for _, path := range envPaths {
		if err := godotenv.Load(path); err == nil {
			log.Printf("✅ Environment loaded from: %s", path)
			envLoaded = true
			break
		}
	}
	if !envLoaded {
		log.Println("⚠️  No .env file found, using environment variables")
	}

	// Get configuration
	port := os.Getenv("BACKEND_PORT")
	if port == "" {
		port = "8080"
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if os.Getenv("DOCKER_ENV") == "true" {
		databaseURL = os.Getenv("DATABASE_URL_DOCKER")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("❌ JWT_SECRET is required")
	}

	// Initialize database
	if err := database.Connect(databaseURL); err != nil {
		log.Fatal("❌ Database connection failed:", err)
	}
	defer database.Close()

	// Initialize JWT
	auth.InitJWT(jwtSecret)

	// Initialize Cloudinary
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")
	
	if cloudName != "" && apiKey != "" && apiSecret != "" {
		if err := cloudinary.Init(cloudName, apiKey, apiSecret); err != nil {
			log.Println("⚠️  Cloudinary initialization failed:", err)
		} else {
			log.Println("✅ Cloudinary initialized")
		}
	}

	// Initialize router
	router := mux.NewRouter()

	// CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	// Health check
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy","service":"backend"}`))
	}).Methods("GET")

	// API routes
	api := router.PathPrefix("/api/v1").Subrouter()
	
	// Public routes
	api.HandleFunc("/auth/register", handlers.Register).Methods("POST")
	api.HandleFunc("/auth/login", handlers.Login).Methods("POST")

	// Protected routes
	protected := api.PathPrefix("").Subrouter()
	protected.Use(middleware.AuthMiddleware)
	
	protected.HandleFunc("/upload", handlers.UploadImage).Methods("POST")
	protected.HandleFunc("/process", handlers.ProcessImage).Methods("POST")
	protected.HandleFunc("/study/{id}", handlers.GetStudySession).Methods("GET")
	protected.HandleFunc("/study/recent", handlers.GetRecentSessions).Methods("GET")

	// Apply CORS
	handler := c.Handler(router)

	log.Printf("🚀 Backend server starting on port %s", port)
	log.Printf("📊 Database connected")
	log.Printf("📍 Endpoints registered:")
	log.Printf("   - POST /api/v1/auth/register")
	log.Printf("   - POST /api/v1/auth/login")
	log.Printf("   - POST /api/v1/upload (protected)")
	log.Printf("   - POST /api/v1/process (protected)")
	log.Printf("   - GET  /api/v1/study/:id (protected)")
	log.Printf("   - GET  /api/v1/study/recent (protected)")
	
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
