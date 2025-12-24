package api

import (
	"fmt"
	"net/http"
	"zhago/internal/dto"
	"zhago/internal/server/hub"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type SSEHandler struct {
	hub *hub.SSEHub
}

func NewSSEHandler(hub *hub.SSEHub) *SSEHandler {
	return &SSEHandler{hub: hub}
}

func (h *SSEHandler) HandleSSE(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	client := &hub.SSEClient{
		ID:      uuid.New().String(),
		Channel: make(chan *dto.MessageRequest, 10),
	}

	h.hub.RegisterClient(client)
	defer h.hub.UnregisterClient(client)

	fmt.Fprintf(w, "event: connected\ndata: {\"client_id\":\"%s\"}\n\n", client.ID)
	if f, ok := w.(http.Flusher); ok {
		f.Flush()
	}

	for {
		select {
		case event := <-client.Channel:
			fmt.Fprint(w, hub.FormatSSEMessage(event))
			if f, ok := w.(http.Flusher); ok {
				f.Flush()
			}
		case <-r.Context().Done():
			return
		}
	}
}

func (h *SSEHandler) RegisterSSERoutes(r *mux.Router) {
	r.HandleFunc("/stream", h.HandleSSE).Methods("GET")
}
