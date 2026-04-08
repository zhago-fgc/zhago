package system

import (
	"encoding/json"
	"os"
	"path/filepath"
	"zhago/internal/config"
)

type OverlayField struct {
	Key     string   `json:"key"`
	Label   string   `json:"label"`
	Type    string   `json:"type"`
	Options []string `json:"options,omitempty"`
}

type OverlayManifest struct {
	Name       string         `json:"name"`
	Subscribes []string       `json:"subscribes"`
	Fields     []OverlayField `json:"fields"`
}

type PackInfo struct {
	DirName     string   `json:"dir_name"`
	Name        string   `json:"name"`
	Author      string   `json:"author"`
	Version     string   `json:"version"`
	Description string   `json:"description"`
	Overlays    []string `json:"overlays"`
}

type TemplateHandler struct {
	templatesDir string
}

func NewTemplateHandler() *TemplateHandler {
	home, _ := os.UserHomeDir()
	return &TemplateHandler{
		templatesDir: filepath.Join(home, ".zhago", "templates"),
	}
}

func (h *TemplateHandler) ListPacks() ([]*PackInfo, error) {
	entries, err := os.ReadDir(h.templatesDir)
	if err != nil {
		if os.IsNotExist(err) {
			return []*PackInfo{}, nil
		}
		return nil, err
	}

	var packs []*PackInfo
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		packDir := filepath.Join(h.templatesDir, entry.Name())
		data, err := os.ReadFile(filepath.Join(packDir, "pack.json"))
		if err != nil {
			continue
		}
		var info struct {
			Name        string `json:"name"`
			Author      string `json:"author"`
			Version     string `json:"version"`
			Description string `json:"description"`
		}
		if err := json.Unmarshal(data, &info); err != nil {
			continue
		}
		// Discover overlay types by scanning subdirectories.
		var overlays []string
		subdirs, _ := os.ReadDir(packDir)
		for _, sub := range subdirs {
			if sub.IsDir() {
				overlays = append(overlays, sub.Name())
			}
		}
		packs = append(packs, &PackInfo{
			DirName:     entry.Name(),
			Name:        info.Name,
			Author:      info.Author,
			Version:     info.Version,
			Description: info.Description,
			Overlays:    overlays,
		})
	}
	return packs, nil
}

func (h *TemplateHandler) GetActivePack() (string, error) {
	cfg, err := config.Load()
	if err != nil {
		return "", err
	}
	return cfg.ActivePack, nil
}

func (h *TemplateHandler) SetActivePack(dirName string) error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	cfg.ActivePack = dirName
	return config.Save(cfg)
}

func (h *TemplateHandler) GetActiveTemplate(overlayType string) (string, error) {
	cfg, err := config.Load()
	if err != nil {
		return "", err
	}
	return cfg.ActiveTemplates[overlayType], nil
}

func (h *TemplateHandler) SetActiveTemplate(overlayType string, packDirName string) error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	if packDirName == "" {
		delete(cfg.ActiveTemplates, overlayType)
	} else {
		cfg.ActiveTemplates[overlayType] = packDirName
	}
	return config.Save(cfg)
}

// resolveOverlayDir uses the same resolution order as the API template handler.
func (h *TemplateHandler) resolveOverlayDir(overlayType string) (string, error) {
	cfg, _ := config.Load()

	tryDir := func(packDirName string) (string, bool) {
		candidate := filepath.Join(h.templatesDir, packDirName, overlayType)
		if info, err := os.Stat(candidate); err == nil && info.IsDir() {
			return candidate, true
		}
		return "", false
	}

	if cfg != nil {
		if packDirName, ok := cfg.ActiveTemplates[overlayType]; ok && packDirName != "" {
			if dir, ok := tryDir(packDirName); ok {
				return dir, nil
			}
		}
		if cfg.ActivePack != "" {
			if dir, ok := tryDir(cfg.ActivePack); ok {
				return dir, nil
			}
		}
	}

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

func (h *TemplateHandler) GetOverlayManifest(overlayType string) (*OverlayManifest, error) {
	dir, err := h.resolveOverlayDir(overlayType)
	if err != nil {
		return nil, err
	}
	data, err := os.ReadFile(filepath.Join(dir, "manifest.json"))
	if err != nil {
		return nil, err
	}
	var manifest OverlayManifest
	if err := json.Unmarshal(data, &manifest); err != nil {
		return nil, err
	}
	return &manifest, nil
}
