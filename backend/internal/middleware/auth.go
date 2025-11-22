package middleware
import (
	"context"
	"net/http"
	"strings"
	"github.com/Zubimendi/neurostudy/internal/auth"
	"github.com/Zubimendi/neurostudy/pkg/responses"
)

type contextKey string

const UserIDKey contextKey = "userID"

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			responses.Error(w, http.StatusUnauthorized, "missing authorization header")
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			responses.Error(w, http.StatusUnauthorized, "invalid authorization header")
			return
		}

		claims, err := auth.ValidateToken(parts[1])
		if err != nil {
			responses.Error(w, http.StatusUnauthorized, "invalid token")
			return
		}

		ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}