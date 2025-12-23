package hub

import (
	"encoding/json"
	"fmt"
	"sync"
	"zhago/internal/dto"
)

type SSEClient struct {
    ID      string
    Channel chan *dto.MatchDataUpdateDTO
}

type SSEHub struct {
    clients    map[string]*SSEClient
    register   chan *SSEClient
    unregister chan *SSEClient
    broadcast  chan *dto.MatchDataUpdateDTO
    mu         sync.RWMutex
}

func NewSSEHub() *SSEHub {
    return &SSEHub{
        clients:    make(map[string]*SSEClient),
        register:   make(chan *SSEClient),
        unregister: make(chan *SSEClient),
        broadcast:  make(chan *dto.MatchDataUpdateDTO, 100),
    }
}

func (h *SSEHub) Run() {
    for {
        select {
        case client := <-h.register:
            h.mu.Lock()
            h.clients[client.ID] = client
            h.mu.Unlock()
            fmt.Printf("Client %s connected. Total: %d\n", client.ID, len(h.clients))

        case client := <-h.unregister:
            h.mu.Lock()
            if _, ok := h.clients[client.ID]; ok {
                delete(h.clients, client.ID)
                close(client.Channel)
            }
            h.mu.Unlock()
            fmt.Printf("Client %s disconnected. Total: %d\n", client.ID, len(h.clients))

        case event := <-h.broadcast:
            h.mu.RLock()
            for _, client := range h.clients {
                select {
                case client.Channel <- event:
                default:
                    // Client is slow, skip
                }
            }
            h.mu.RUnlock()
        }
    }
}

func (h *SSEHub) BroadcastEvent(event *dto.MatchDataUpdateDTO) {
    h.broadcast <- event
}

func (h *SSEHub) RegisterClient(client *SSEClient) {
    h.register <- client
}

func (h *SSEHub) UnregisterClient(client *SSEClient) {
    h.unregister <- client
}

func FormatSSEMessage(event *dto.MatchDataUpdateDTO) string {
    data, _ := json.Marshal(event)
    return fmt.Sprintf("event: %s\ndata: %s\n\n", "update", string(data))
}
