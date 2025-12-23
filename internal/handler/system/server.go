package system

import (
	"log"
	"sync"
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

	h.srv = server.NewServer(port)

	go func() {
		if err := h.srv.Start(); err != nil {
			log.Fatalln("could not start HTTP server")
		}
	}()

	return nil
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

func (h *ServerHandler) PushUpdate(data dto.MatchDataUpdateDTO) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.srv != nil {
		h.srv.GetHub().BroadcastEvent(&data)
	}
}
