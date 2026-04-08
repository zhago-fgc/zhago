package model

import "time"

type Player struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Tag       string    `gorm:"not null" json:"tag"`
	Team      string    `json:"team"`
	Region    string    `json:"region"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
