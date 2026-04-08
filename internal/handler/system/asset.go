package system

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
)

type CharacterInfo struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type GameManifest struct {
	Name                string          `json:"name"`
	CharactersPerPlayer int             `json:"characters_per_player"`
	Characters          []CharacterInfo `json:"characters"`
}

type AssetHandler struct {
	assetsDir string
}

func NewAssetHandler() *AssetHandler {
	home, _ := os.UserHomeDir()
	return &AssetHandler{
		assetsDir: filepath.Join(home, ".zhago", "assets"),
	}
}

// GetGameManifest looks up the asset manifest for a game by name (case-insensitive).
// Tries dir-name prefix matching first, then falls back to matching the manifest's
// Name field — so full names like "Street Fighter 6" resolve to the "sf6" pack.
// Returns a default manifest (1 character per player, no character list) if not found.
func (h *AssetHandler) GetGameManifest(game string) (*GameManifest, error) {
	if game == "" {
		return defaultGameManifest(), nil
	}

	entries, err := os.ReadDir(h.assetsDir)
	if err != nil {
		return defaultGameManifest(), nil
	}

	needle := strings.ToLower(strings.ReplaceAll(game, " ", ""))

	// Pass 1: match by directory name (fast, no file I/O beyond ReadDir).
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		dirName := strings.ToLower(strings.ReplaceAll(entry.Name(), "-", ""))
		if dirName == needle || strings.HasPrefix(dirName, needle) || strings.HasPrefix(needle, dirName) {
			if m := h.readManifest(entry.Name()); m != nil {
				return m, nil
			}
		}
	}

	// Pass 2: match by the manifest's Name field (handles full names from start.gg).
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		m := h.readManifest(entry.Name())
		if m == nil {
			continue
		}
		manifestName := strings.ToLower(strings.ReplaceAll(m.Name, " ", ""))
		if manifestName == needle || strings.HasPrefix(manifestName, needle) || strings.HasPrefix(needle, manifestName) {
			return m, nil
		}
	}

	return defaultGameManifest(), nil
}

func (h *AssetHandler) readManifest(dirName string) *GameManifest {
	data, err := os.ReadFile(filepath.Join(h.assetsDir, dirName, "manifest.json"))
	if err != nil {
		return nil
	}
	var m GameManifest
	if err := json.Unmarshal(data, &m); err != nil {
		return nil
	}
	if m.CharactersPerPlayer < 1 {
		m.CharactersPerPlayer = 1
	}
	return &m
}

// InstalledAsset summarises a game asset pack for display in the UI.
type InstalledAsset struct {
	DirName             string `json:"dir_name"`
	Name                string `json:"name"`
	CharactersPerPlayer int    `json:"characters_per_player"`
	CharacterCount      int    `json:"character_count"`
}

// ListInstalledAssets returns a summary of every game asset pack in assetsDir.
func (h *AssetHandler) ListInstalledAssets() ([]*InstalledAsset, error) {
	entries, err := os.ReadDir(h.assetsDir)
	if err != nil {
		if os.IsNotExist(err) {
			return []*InstalledAsset{}, nil
		}
		return nil, err
	}

	var assets []*InstalledAsset
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		m := h.readManifest(entry.Name())
		if m == nil {
			continue
		}
		assets = append(assets, &InstalledAsset{
			DirName:             entry.Name(),
			Name:                m.Name,
			CharactersPerPlayer: m.CharactersPerPlayer,
			CharacterCount:      len(m.Characters),
		})
	}
	return assets, nil
}

func defaultGameManifest() *GameManifest {
	return &GameManifest{CharactersPerPlayer: 1, Characters: []CharacterInfo{}}
}
