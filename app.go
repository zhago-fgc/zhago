package main

import (
	"context"
	"log"
	"net/http"
	"sync"
	"zhago/internal/database"
	"zhago/internal/repository"
	"zhago/internal/service"
	"zhago/internal/sse"
	"zhago/internal/static"

	"github.com/gorilla/mux"
)

// App struct
type App struct {
	ctx 				context.Context
	server 			*http.Server
	serverMu 		sync.Mutex
	SSEService 	*sse.Service
	EventService *service.EventService
}

// NewApp creates a new App application struct
func NewApp() *App {
	broadcaster := sse.NewBroadcaster()
	sseService := sse.NewService(broadcaster)
	repository := repository.NewEventRepository(database.Connection)
	eventService := service.NewEventService(*repository)

	return &App{
		SSEService: sseService,
		EventService: eventService,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) StartHTTPServer(port string) error {
	a.serverMu.Lock()
	defer a.serverMu.Unlock()

	if a.server != nil {
		return nil
	}

	router := mux.NewRouter()
	static.NewHandler().RegisterRoutes(router)
	a.SSEService.Broadcaster.RegisterRoutes(router)

	addr := ":" + port
	a.server = &http.Server{
		Addr: addr,
		Handler: router,
	}
	
	go func() {
		log.Printf("Starting HTTP server on %s\n", addr)
		if err := a.server.ListenAndServe(); err != http.ErrServerClosed {
			log.Printf("HTTP server error: %v\n", err)
  	}
	}()

	return nil
}

func (a *App) StopHTTPServer() error {
	a.serverMu.Lock()
	defer a.serverMu.Unlock()

	if a.server == nil {
		return nil // No server running
	}

	log.Println("Stopping HTTP server...")
	
	if err := a.server.Close(); err != nil {
		log.Printf("Error shutting down server: %v", err)
		return err
	}

	a.server = nil
	log.Println("HTTP server stopped")
	return nil
}

func (a *App) IsServerRunning() bool {
	a.serverMu.Lock()
	defer a.serverMu.Unlock()
	return a.server != nil
}

func (a *App) Save(data sse.MatchDataUpdateDTO) {
	a.SSEService.UpdateMatchData(data)
}
