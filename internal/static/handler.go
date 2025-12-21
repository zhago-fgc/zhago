package static

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gorilla/mux"
)

type Handler struct{
	StaticDir string
}


func NewHandler() *Handler {
	wd, _ := os.Getwd()
	return &Handler{
		StaticDir: filepath.Join(wd, "internal/static/template"),
	}
}

func (h *Handler) HandleStatic(w http.ResponseWriter, r *http.Request) {
	requestedPath := strings.TrimPrefix(r.URL.Path, "/static/")
	
	filePath := filepath.Join(h.StaticDir, requestedPath)

	if !strings.HasPrefix(filepath.Clean(filePath), h.StaticDir) {
		http.Error(w, "invalid path", http.StatusBadRequest)
		return
	}

	data, err := os.ReadFile(filePath)
	if err != nil {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func (h *Handler) RegisterRoutes(r *mux.Router) {
	r.HandleFunc("/static/", h.HandleStatic).Methods("GET")
}
