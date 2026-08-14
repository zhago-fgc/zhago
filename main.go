package main

import (
	"embed"
	"log"
	"zhago/internal/bootstrap"
	"zhago/internal/database"
	"zhago/internal/handler/system"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed all:templates/default-minimal
var defaultTemplates embed.FS

func main() {
	db := database.Connection

	serverHandler      := system.NewServerHandler()
	eventHandler       := system.NewEventHandler(db)
	tournamentHandler  := system.NewTournamentHandler(db)
	playerHandler      := system.NewPlayerHandler(db)
	setHandler         := system.NewSetHandler(db)
	scoreboardHandler  := system.NewScoreboardHandler(serverHandler)
	templateHandler    := system.NewTemplateHandler()
	assetHandler       := system.NewAssetHandler()
	commentatorHandler := system.NewCommentatorHandler(db)
	startggHandler     := system.NewStartGGHandler(db)

	app := application.New(application.Options{
		Name: "zhago",
		Services: []application.Service{
			application.NewService(serverHandler),
			application.NewService(eventHandler),
			application.NewService(tournamentHandler),
			application.NewService(playerHandler),
			application.NewService(setHandler),
			application.NewService(scoreboardHandler),
			application.NewService(templateHandler),
			application.NewService(assetHandler),
			application.NewService(commentatorHandler),
			application.NewService(startggHandler),
		},
		Assets: application.AssetOptions{
			Handler: application.BundledAssetFileServer(assets),
		},
		OnShutdown: func() {
			serverHandler.StopServer()
		},
	})

	if err := bootstrap.EnsureDefaultTemplates(defaultTemplates); err != nil {
		log.Printf("bootstrap: failed to extract default templates: %v", err)
	}
	if err := serverHandler.StartServer(serverHandler.GetConfigPort()); err != nil {
		log.Printf("server: failed to auto-start: %v", err)
	}

	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:  "zhago",
		Width:  1024,
		Height: 768,
		URL:    "/",
		BackgroundColour: application.NewRGBA(9, 9, 11, 255),
	})

	if err := app.Run(); err != nil {
		log.Fatal("Error:", err)
	}
}
