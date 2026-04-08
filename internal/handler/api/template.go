package api

import (
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"zhago/internal/config"

	"github.com/gorilla/mux"
)

type TemplateHandler struct {
	templatesDir string
}

func NewTemplateHandler() *TemplateHandler {
	home, _ := os.UserHomeDir()
	return &TemplateHandler{
		templatesDir: filepath.Join(home, ".zhago", "templates"),
	}
}

// findOverlayDir resolves the directory that contains files for the given overlay type.
// Resolution order:
//  1. Per-type override in config.active_templates
//  2. Active pack's overlay subdir
//  3. First pack that has a matching overlay subdir (fallback)
func (h *TemplateHandler) findOverlayDir(overlayType string) (string, error) {
	cfg, _ := config.Load()

	tryDir := func(packDirName string) (string, bool) {
		candidate := filepath.Join(h.templatesDir, packDirName, overlayType)
		if info, err := os.Stat(candidate); err == nil && info.IsDir() {
			return candidate, true
		}
		return "", false
	}

	if cfg != nil {
		// 1. Per-type override.
		if packDirName, ok := cfg.ActiveTemplates[overlayType]; ok && packDirName != "" {
			if dir, ok := tryDir(packDirName); ok {
				return dir, nil
			}
		}
		// 2. Active pack.
		if cfg.ActivePack != "" {
			if dir, ok := tryDir(cfg.ActivePack); ok {
				return dir, nil
			}
		}
	}

	// 3. Fallback: first pack with this overlay type.
	entries, err := os.ReadDir(h.templatesDir)
	if err != nil {
		return "", os.ErrNotExist
	}
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		if dir, ok := tryDir(entry.Name()); ok {
			return dir, nil
		}
	}
	return "", os.ErrNotExist
}

func (h *TemplateHandler) HandleTemplate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	overlayType := vars["overlayType"]
	filePath := vars["file"]

	overlayDir, err := h.findOverlayDir(overlayType)
	if err != nil {
		http.Error(w, "template not found", http.StatusNotFound)
		return
	}

	fullPath := filepath.Join(overlayDir, filePath)
	if !strings.HasPrefix(filepath.Clean(fullPath), filepath.Clean(overlayDir)) {
		http.Error(w, "invalid path", http.StatusBadRequest)
		return
	}

	data, err := os.ReadFile(fullPath)
	if err != nil {
		http.Error(w, "file not found", http.StatusNotFound)
		return
	}

	contentType := mime.TypeByExtension(filepath.Ext(filePath))
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	w.Header().Set("Content-Type", contentType)
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func (h *TemplateHandler) RegisterRoutes(r *mux.Router) {
	r.HandleFunc("/{overlayType}/{file:.+}", h.HandleTemplate).Methods("GET")
}
