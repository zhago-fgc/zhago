package sse

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/mux"
)

type Broadcaster struct{
	clients map[chan MatchDataUpdateDTO]bool
	mu			sync.RWMutex
}

func NewBroadcaster() *Broadcaster {
	return &Broadcaster{
		clients: make(map[chan MatchDataUpdateDTO]bool),
	} 
}

func (b *Broadcaster) Broadcast(data MatchDataUpdateDTO) {
	b.mu.RLock()
	defer b.mu.RUnlock()

	log.Printf("Broadcasting to %d clients\n", len(b.clients))

	for clientChan := range b.clients {
		select {
		case clientChan <- data:
		default:
			log.Println("Client channel full, skipping")
		}
	}
}

func (b *Broadcaster) HandleSSE(w http.ResponseWriter, r *http.Request) {
	rc := http.NewResponseController(w)

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	
	clientChan := make(chan MatchDataUpdateDTO, 100)
	
	b.mu.Lock()
	b.clients[clientChan] = true
	clientCount := len(b.clients)
	b.mu.Unlock()
	
	log.Printf("New SSE client connected (total: %d)", clientCount)

	defer func() {
		b.mu.Lock()
		delete(b.clients, clientChan)
		close(clientChan)
		clientCount := len(b.clients)
		b.mu.Unlock()
		log.Printf("SSE client disconnected (remaining: %d)", clientCount)
	}()

	ctx := r.Context()

	for {
		select {
		case <-ctx.Done():
			log.Println("Client disconnected")
			return
		case update := <-clientChan:
			jsonData, err := json.Marshal(update)
			if err != nil {
				log.Printf("Error while marshaling JSON: %v\n", err)
				continue
			}
			fmt.Fprintf(w, "event:update\ndata: %s\n\n", jsonData)
			rc.Flush()
		}
	}
}

func (b *Broadcaster) RegisterRoutes(r *mux.Router) {
	r.HandleFunc("/stream", b.HandleSSE).Methods("GET")
}

