package main

import (
	"context"
	"embed"
	"log"
	"zhago/internal/bootstrap"
	"zhago/internal/database"
	"zhago/internal/handler/system"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
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

	err := wails.Run(&options.App{
		Title:  "zhago",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{
			R: 9,
			G: 9,
			B: 11,
			A: 255,
		},
		OnStartup: func(ctx context.Context) {
			if err := bootstrap.EnsureDefaultTemplates(defaultTemplates); err != nil {
				log.Printf("bootstrap: failed to extract default templates: %v", err)
			}
			if err := serverHandler.StartServer(serverHandler.GetConfigPort()); err != nil {
				log.Printf("server: failed to auto-start: %v", err)
			}
		},
		OnShutdown: func(ctx context.Context) {
			serverHandler.StopServer()
		},
		Bind: []any{
			serverHandler,
			eventHandler,
			tournamentHandler,
			playerHandler,
			setHandler,
			scoreboardHandler,
			templateHandler,
			assetHandler,
			commentatorHandler,
			startggHandler,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
