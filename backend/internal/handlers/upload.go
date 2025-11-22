package handlers

import (
	"context"
	"net/http"
	"github.com/google/uuid"
	"github.com/Zubimendi/neurostudy/internal/database"
	"github.com/Zubimendi/neurostudy/internal/middleware"
	"github.com/Zubimendi/neurostudy/pkg/cloudinary"
	"github.com/Zubimendi/neurostudy/pkg/responses"
)

func UploadImage(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)

	// Parse multipart form
	if err := r.ParseMultipartForm(10 << 20); err != nil { // 10MB max
		responses.Error(w, http.StatusBadRequest, "file too large")
		return
	}

	file, _, err := r.FormFile("image")
	if err != nil {
		responses.Error(w, http.StatusBadRequest, "no image provided")
		return
	}
	defer file.Close()

	// Upload to Cloudinary
	imageURL, err := cloudinary.UploadImage(context.Background(), file)
	if err != nil {
		responses.Error(w, http.StatusInternalServerError, "error uploading image")
		return
	}

	// Create study session
	var sessionID uuid.UUID
	query := `
		INSERT INTO study_sessions (user_id, image_url, status)
		VALUES ($1, $2, 'uploaded')
		RETURNING id
	`
	err = database.DB.QueryRow(query, userID, imageURL).Scan(&sessionID)
	if err != nil {
		responses.Error(w, http.StatusInternalServerError, "error creating session")
		return
	}

	responses.JSON(w, http.StatusCreated, map[string]interface{}{
		"session_id": sessionID,
		"image_url":  imageURL,
	})
}