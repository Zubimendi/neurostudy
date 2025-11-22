package handlers
import (
	"database/sql"
	"encoding/json"
	"net/http"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"github.com/Zubimendi/neurostudy/internal/auth"
	"github.com/Zubimendi/neurostudy/internal/database"
	"github.com/Zubimendi/neurostudy/internal/models"
	"github.com/Zubimendi/neurostudy/pkg/responses"
)

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		responses.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		responses.Error(w, http.StatusInternalServerError, "error hashing password")
		return
	}

	// Create user
	var user models.User
	query := `
		INSERT INTO users (email, password_hash, full_name)
		VALUES ($1, $2, $3)
		RETURNING id, email, full_name, created_at, updated_at
	`
	err = database.DB.QueryRow(query, req.Email, string(hashedPassword), req.FullName).
		Scan(&user.ID, &user.Email, &user.FullName, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		responses.Error(w, http.StatusConflict, "email already exists")
		return
	}

	// Generate token
	token, err := auth.GenerateToken(user.ID, user.Email)
	if err != nil {
		responses.Error(w, http.StatusInternalServerError, "error generating token")
		return
	}

	responses.JSON(w, http.StatusCreated, map[string]interface{}{
		"user":  user,
		"token": token,
	})
}

func Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		responses.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Get user
	var user models.User
	query := `SELECT id, email, password_hash, full_name, created_at, updated_at FROM users WHERE email = $1`
	err := database.DB.QueryRow(query, req.Email).
		Scan(&user.ID, &user.Email, &user.PasswordHash, &user.FullName, &user.CreatedAt, &user.UpdatedAt)

	if err == sql.ErrNoRows {
		responses.Error(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		responses.Error(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	// Generate token
	token, err := auth.GenerateToken(user.ID, user.Email)
	if err != nil {
		responses.Error(w, http.StatusInternalServerError, "error generating token")
		return
	}

	responses.JSON(w, http.StatusOK, map[string]interface{}{
		"user":  user,
		"token": token,
	})
}