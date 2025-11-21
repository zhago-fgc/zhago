package static

import (
	"embed"
	"net/http"

	"github.com/gorilla/mux"
)

type Handler struct{}

//go:embed template/*
var staticFs embed.FS

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) HandleScoreboard(w http.ResponseWriter, r *http.Request) {
	html, err := staticFs.ReadFile("template/scoreboard.html")
	if err != nil {
		http.Error(w, "Template not found", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write(html)
}

func (h *Handler) RegisterRoutes(r *mux.Router) {
	r.HandleFunc("/scoreboard", h.HandleScoreboard).Methods("GET")
}
