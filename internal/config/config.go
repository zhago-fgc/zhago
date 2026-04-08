package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

type Config struct {
	ActivePack      string            `json:"active_pack"`
	ActiveTemplates map[string]string `json:"active_templates"` // per-type overrides
	Port            int               `json:"port"`             // HTTP server port (default 3000)
}

var (
	mu       sync.RWMutex
	cached   *Config
	filePath string
)

func init() {
	home, _ := os.UserHomeDir()
	filePath = filepath.Join(home, ".zhago", "config.json")
}

func Load() (*Config, error) {
	mu.RLock()
	if cached != nil {
		defer mu.RUnlock()
		return cached, nil
	}
	mu.RUnlock()

	mu.Lock()
	defer mu.Unlock()

	cfg := &Config{ActiveTemplates: make(map[string]string)}
	data, err := os.ReadFile(filePath)
	if err == nil {
		json.Unmarshal(data, cfg)
	}
	if cfg.ActiveTemplates == nil {
		cfg.ActiveTemplates = make(map[string]string)
	}
	cached = cfg
	return cfg, nil
}

func Save(cfg *Config) error {
	mu.Lock()
	defer mu.Unlock()

	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return err
	}
	cached = cfg
	return nil
}
