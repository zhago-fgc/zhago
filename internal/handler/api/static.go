package api

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gorilla/mux"
)

type StaticHandler struct {
	StaticDir string
}

func NewStaticHandler() *StaticHandler {
	wd, _ := os.Getwd()
	return &StaticHandler{
		StaticDir: filepath.Join(wd, "templates/scoreboard"),
	}
}

func (h *StaticHandler) HandleStatic(w http.ResponseWriter, r *http.Request) {
	requestedPath := strings.TrimPrefix(r.URL.Path, "/scoreboard/")

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
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func (h *StaticHandler) RegisterStaticRoutes(r *mux.Router) {
	r.PathPrefix("/scoreboard/").HandlerFunc(h.HandleStatic).Methods("GET")
}
