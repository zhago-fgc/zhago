package api

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gorilla/mux"
)

type StaticHandler struct{
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

	log.Printf("requested path: %s", filePath)

	if !strings.HasPrefix(filepath.Clean(filePath), h.StaticDir) {
		http.Error(w, "invalid path", http.StatusBadRequest)
		return
	}

	data, err := os.ReadFile(filePath)
	if err != nil {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}
	contentType := getContentType(filePath)
	w.Header().Set("Content-Type", contentType)
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func getContentType(path string) string {
	ext := strings.ToLower(filepath.Ext(path))
	switch ext {
	case ".html":
		return "text/html; charset=utf-8"
	case ".css":
		return "text/css; charset=utf-8"
	case ".js":
		return "application/javascript; charset=utf-8"
	case ".json":
		return "application/json; charset=utf-8"
	case ".png":
		return "image/png"
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".svg":
		return "image/svg+xml"
	case ".woff", ".woff2":
		return "font/woff2"
	default:
		return "application/octet-stream"
	}
}

func (h *StaticHandler) RegisterStaticRoutes(r *mux.Router) {
	r.PathPrefix("/scoreboard/").HandlerFunc(h.HandleStatic).Methods("GET")
}
