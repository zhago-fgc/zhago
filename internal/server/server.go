package server

import (
	"fmt"
	"log"
	"net/http"
	"zhago/internal/handler/api"
	"zhago/internal/server/hub"

	"github.com/gorilla/mux"
)

type Server struct {
	port       int
	hub        *hub.SSEHub
	httpServer *http.Server
}

func NewServer(port int) *Server {
	h := hub.NewSSEHub()
	go h.Run()

	router := mux.NewRouter()

	api.NewSSEHandler(h).RegisterSSERoutes(router)

	api.NewStaticHandler().RegisterStaticRoutes(router)

	return &Server{
		port: port,
		hub:  h,
		httpServer: &http.Server{
			Addr:    fmt.Sprintf(":%d", port),
			Handler: router,
		},
	}
}

func (s *Server) Start() error {
	return s.httpServer.ListenAndServe()
}

func (s *Server) Stop() error {
	log.Printf("stopping HTTP server")
	return s.httpServer.Close()
}

func (s *Server) GetHub() *hub.SSEHub {
	return s.hub
}
