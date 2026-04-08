package database

import (
	"fmt"
	"os"
	"path/filepath"
	"zhago/internal/domain/model"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var Connection = initDatabaseConnection()

func initDatabaseConnection() *gorm.DB {
	home, err := os.UserHomeDir()
	if err != nil {
		panic(fmt.Sprintf("failed to resolve home directory: %v", err))
	}

	dir := filepath.Join(home, ".zhago")
	if err := os.MkdirAll(dir, 0755); err != nil {
		panic(fmt.Sprintf("failed to create data directory: %v", err))
	}

	dbPath := filepath.Join(dir, "zhago.db")

	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		panic(fmt.Sprintf("failed to connect to database: %v", err))
	}

	if err := db.AutoMigrate(
		&model.Event{},
		&model.Player{},
		&model.Tournament{},
		&model.PlayerAlias{},
		&model.PlayerCharacter{},
		&model.Set{},
		&model.Commentator{},
	); err != nil {
		panic(fmt.Sprintf("migration failed: %v", err))
	}

	return db
}
