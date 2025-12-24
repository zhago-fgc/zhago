package hub

import (
	"encoding/json"
	"fmt"
	"sync"
	"zhago/internal/dto"
)

type SSEClient struct {
	ID      string
	Channel chan *dto.MessageRequest
}

type SSEHub struct {
	clients    map[string]*SSEClient
	register   chan *SSEClient
	unregister chan *SSEClient
	broadcast  chan *dto.MessageRequest
	current    *dto.MessageRequest
	mu         sync.RWMutex
}

func NewSSEHub() *SSEHub {
	return &SSEHub{
		clients:    make(map[string]*SSEClient),
		register:   make(chan *SSEClient),
		unregister: make(chan *SSEClient),
		broadcast:  make(chan *dto.MessageRequest, 100),
	}
}

func (h *SSEHub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client.ID] = client
			if h.current != nil {
				select {
				case client.Channel <- h.current:
				default:
				}
			}
			h.mu.Unlock()
			fmt.Printf("client %s connected. Total: %d\n", client.ID, len(h.clients))
		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.ID]; ok {
				delete(h.clients, client.ID)
				close(client.Channel)
			}
			h.mu.Unlock()
			fmt.Printf("client %s disconnected. Total: %d\n", client.ID, len(h.clients))

		case event := <-h.broadcast:
			h.mu.RLock()
			for _, client := range h.clients {
				select {
				case client.Channel <- event:
				default:
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *SSEHub) BroadcastEvent(event *dto.MessageRequest) {
	h.mu.Lock()
	h.current = event
	h.mu.Unlock()

	h.broadcast <- event
}

func (h *SSEHub) RegisterClient(client *SSEClient) {
	h.register <- client
}

func (h *SSEHub) UnregisterClient(client *SSEClient) {
	h.unregister <- client
}

func FormatSSEMessage(message *dto.MessageRequest) string {
	data, _ := json.Marshal(message)
	return fmt.Sprintf("event: %s\ndata: %s\n\n", "update", data)
}
