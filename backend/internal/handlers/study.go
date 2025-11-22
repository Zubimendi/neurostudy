package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/Zubimendi/neurostudy/internal/database"
	"github.com/Zubimendi/neurostudy/internal/middleware"
	"github.com/Zubimendi/neurostudy/pkg/responses"
)

type ProcessRequest struct {
	SessionID string `json:"session_id"`
	ImageURL  string `json:"image_url"`
}

func ProcessImage(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey)
	if userID == nil {
		responses.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req ProcessRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		responses.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.SessionID == "" || req.ImageURL == "" {
		responses.Error(w, http.StatusBadRequest, "session_id and image_url are required")
		return
	}

	// TODO: Call AI worker to process the image
	// For now, just update the session status
	query := `
		UPDATE study_sessions 
		SET status = 'processing', updated_at = $1
		WHERE id = $2 AND user_id = $3
	`
	_, err := database.DB.Exec(query, time.Now(), req.SessionID, userID)
	if err != nil {
		responses.Error(w, http.StatusInternalServerError, "failed to update session")
		return
	}

	responses.JSON(w, http.StatusOK, map[string]interface{}{
		"session_id": req.SessionID,
		"status":     "processing",
		"message":    "Image processing started",
	})
}

func GetStudySession(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey)
	if userID == nil {
		responses.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	vars := mux.Vars(r)
	sessionID := vars["id"]

	if sessionID == "" {
		responses.Error(w, http.StatusBadRequest, "session id is required")
		return
	}

	// Get study session
	var session struct {
		ID            string    `json:"id"`
		UserID        string    `json:"user_id"`
		Title         string    `json:"title"`
		ImageURL      string    `json:"image_url"`
		ExtractedText string    `json:"extracted_text"`
		Topic         string    `json:"topic"`
		Status        string    `json:"status"`
		CreatedAt     time.Time `json:"created_at"`
	}

	query := `
		SELECT id, user_id, COALESCE(title, ''), image_url, 
		       COALESCE(extracted_text, ''), COALESCE(topic, ''), 
		       status, created_at
		FROM study_sessions 
		WHERE id = $1 AND user_id = $2
	`
	err := database.DB.QueryRow(query, sessionID, userID).Scan(
		&session.ID, &session.UserID, &session.Title, &session.ImageURL,
		&session.ExtractedText, &session.Topic, &session.Status, &session.CreatedAt,
	)

	if err != nil {
		responses.Error(w, http.StatusNotFound, "session not found")
		return
	}

	// Get summaries
	var summary struct {
		ShortSummary          string   `json:"short_summary"`
		DetailedSummary       string   `json:"detailed_summary"`
		SimplifiedExplanation string   `json:"simplified_explanation"`
		KeyConcepts           []string `json:"key_concepts"`
	}

	summaryQuery := `
		SELECT COALESCE(short_summary, ''), 
		       COALESCE(detailed_summary, ''),
		       COALESCE(simplified_explanation, ''),
		       COALESCE(key_concepts, '[]'::jsonb)
		FROM summaries 
		WHERE session_id = $1
	`
	var keyConceptsJSON []byte
	err = database.DB.QueryRow(summaryQuery, sessionID).Scan(
		&summary.ShortSummary,
		&summary.DetailedSummary,
		&summary.SimplifiedExplanation,
		&keyConceptsJSON,
	)

	if err == nil {
		json.Unmarshal(keyConceptsJSON, &summary.KeyConcepts)
	}

	// Get flashcards
	flashcardQuery := `SELECT front, back FROM flashcards WHERE session_id = $1`
	rows, err := database.DB.Query(flashcardQuery, sessionID)
	flashcards := []map[string]string{}
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var front, back string
			if err := rows.Scan(&front, &back); err == nil {
				flashcards = append(flashcards, map[string]string{
					"front": front,
					"back":  back,
				})
			}
		}
	}

	// Get quiz questions
	quizQuery := `
		SELECT q.question, q.options, q.correct_answer, q.explanation
		FROM quiz_questions q
		JOIN quizzes qz ON q.quiz_id = qz.id
		WHERE qz.session_id = $1
		ORDER BY q.question_order
	`
	quizRows, err := database.DB.Query(quizQuery, sessionID)
	quizQuestions := []map[string]interface{}{}
	if err == nil {
		defer quizRows.Close()
		for quizRows.Next() {
			var question, correctAnswer, explanation string
			var optionsJSON []byte
			if err := quizRows.Scan(&question, &optionsJSON, &correctAnswer, &explanation); err == nil {
				var options map[string]string
				json.Unmarshal(optionsJSON, &options)
				quizQuestions = append(quizQuestions, map[string]interface{}{
					"question":       question,
					"options":        options,
					"correct_answer": correctAnswer,
					"explanation":    explanation,
				})
			}
		}
	}

	responses.JSON(w, http.StatusOK, map[string]interface{}{
		"id":                     session.ID,
		"title":                  session.Title,
		"image_url":              session.ImageURL,
		"extracted_text":         session.ExtractedText,
		"topic":                  session.Topic,
		"status":                 session.Status,
		"created_at":             session.CreatedAt,
		"short_summary":          summary.ShortSummary,
		"detailed_summary":       summary.DetailedSummary,
		"simplified_explanation": summary.SimplifiedExplanation,
		"key_concepts":           summary.KeyConcepts,
		"flashcards":             flashcards,
		"quiz_questions":         quizQuestions,
	})
}

func GetRecentSessions(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey)
	if userID == nil {
		responses.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	query := `
		SELECT id, COALESCE(title, ''), COALESCE(topic, ''), status, created_at
		FROM study_sessions 
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 20
	`

	rows, err := database.DB.Query(query, userID)
	if err != nil {
		responses.Error(w, http.StatusInternalServerError, "failed to fetch sessions")
		return
	}
	defer rows.Close()

	sessions := []map[string]interface{}{}
	for rows.Next() {
		var id, title, topic, status string
		var createdAt time.Time

		if err := rows.Scan(&id, &title, &topic, &status, &createdAt); err != nil {
			continue
		}

		sessions = append(sessions, map[string]interface{}{
			"id":         id,
			"title":      title,
			"topic":      topic,
			"status":     status,
			"created_at": createdAt,
		})
	}

	responses.JSON(w, http.StatusOK, sessions)
}
