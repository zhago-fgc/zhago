package system

import (
	"log"
	"sync"
	"zhago/internal/config"
	"zhago/internal/dto"
	"zhago/internal/server"
)

type ServerHandler struct {
	srv *server.Server
	mu  sync.Mutex
}

func NewServerHandler() *ServerHandler {
	return &ServerHandler{}
}

func (h *ServerHandler) StartServer(port int) error {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.srv != nil {
		return nil
	}

	// Persist the chosen port so it survives restarts.
	if cfg, err := config.Load(); err == nil {
		cfg.Port = port
		config.Save(cfg) //nolint:errcheck
	}

	h.srv = server.NewServer(port)

	go func() {
		if err := h.srv.Start(); err != nil {
			log.Printf("HTTP server error: %v", err)

			h.mu.Lock()
			h.srv = nil
			h.mu.Unlock()
		}
	}()

	return nil
}

// GetConfigPort returns the last-saved port from config (default 3000).
// Used by Settings on mount so the field shows the persisted value even
// before the server has started.
func (h *ServerHandler) GetConfigPort() int {
	if cfg, err := config.Load(); err == nil && cfg.Port > 0 {
		return cfg.Port
	}
	return 3000
}

func (h *ServerHandler) StopServer() error {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.srv == nil {
		return nil
	}

	err := h.srv.Stop()
	h.srv = nil
	return err
}

func (h *ServerHandler) IsRunning() bool {
	h.mu.Lock()
	defer h.mu.Unlock()
	return h.srv != nil
}

func (h *ServerHandler) GetPort() int {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.srv == nil {
		return 0
	}
	return h.srv.GetPort()
}

func (h *ServerHandler) ClientCount() int {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.srv == nil {
		return 0
	}
	return h.srv.ClientCount()
}

func (h *ServerHandler) Broadcast(data dto.MessageRequest) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.srv != nil {
		h.srv.GetHub().BroadcastEvent(&data)
	}
}

func (h *ServerHandler) BroadcastMessage(msgType string, payload map[string]interface{}) {
	h.Broadcast(dto.MessageRequest{
		Type:    msgType,
		Payload: payload,
	})
}
