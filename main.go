package main

import (
	"context"
	"embed"
	"log"
	"zhago/internal/handler/system"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"go.etcd.io/bbolt"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {

	db, err := bbolt.Open("zhago.db", 0600, nil)
	if err != nil {
		log.Fatal(err)
	}

	serverHandler := system.NewServerHandler()
	eventHandler := system.NewEventHandler(db)
	scoreboardHandler := system.NewScoreboardHandler(serverHandler)

	err = wails.Run(&options.App{
		Title:  "zhago",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{
			R: 255,
			G: 255,
			B: 255,
			A: 0,
		},
		OnStartup: func(ctx context.Context) {},
		OnShutdown: func(ctx context.Context) {
			serverHandler.StopServer()
		},
		Bind: []any{
			serverHandler,
			eventHandler,
			scoreboardHandler,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
