package models

import (
	"time"
	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	FullName     string    `json:"full_name" db:"full_name"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type StudySession struct {
	ID            uuid.UUID `json:"id" db:"id"`
	UserID        uuid.UUID `json:"user_id" db:"user_id"`
	Title         string    `json:"title" db:"title"`
	ImageURL      string    `json:"image_url" db:"image_url"`
	ExtractedText string    `json:"extracted_text" db:"extracted_text"`
	Topic         string    `json:"topic" db:"topic"`
	Status        string    `json:"status" db:"status"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at"`
}

type Summary struct {
	ID                    uuid.UUID              `json:"id" db:"id"`
	SessionID             uuid.UUID              `json:"session_id" db:"session_id"`
	ShortSummary          string                 `json:"short_summary" db:"short_summary"`
	DetailedSummary       string                 `json:"detailed_summary" db:"detailed_summary"`
	SimplifiedExplanation string                 `json:"simplified_explanation" db:"simplified_explanation"`
	KeyConcepts           map[string]interface{} `json:"key_concepts" db:"key_concepts"`
	CreatedAt             time.Time              `json:"created_at" db:"created_at"`
}

type Flashcard struct {
	ID           uuid.UUID `json:"id" db:"id"`
	SessionID    uuid.UUID `json:"session_id" db:"session_id"`
	Front        string    `json:"front" db:"front"`
	Back         string    `json:"back" db:"back"`
	IsBookmarked bool      `json:"is_bookmarked" db:"is_bookmarked"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

type Quiz struct {
	ID        uuid.UUID `json:"id" db:"id"`
	SessionID uuid.UUID `json:"session_id" db:"session_id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type QuizQuestion struct {
	ID            uuid.UUID              `json:"id" db:"id"`
	QuizID        uuid.UUID              `json:"quiz_id" db:"quiz_id"`
	Question      string                 `json:"question" db:"question"`
	Options       map[string]interface{} `json:"options" db:"options"`
	CorrectAnswer string                 `json:"correct_answer" db:"correct_answer"`
	Explanation   string                 `json:"explanation" db:"explanation"`
	QuestionOrder int                    `json:"question_order" db:"question_order"`
	CreatedAt     time.Time              `json:"created_at" db:"created_at"`
}