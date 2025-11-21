package database

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var Connection = initDatabaseConnection()

func initDatabaseConnection() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("zhago.db"), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	return db
}
