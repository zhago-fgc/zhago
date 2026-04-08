package model

import (
	"time"
	"zhago/internal/constant"
)

type Tournament struct {
	ID          string          `gorm:"primaryKey" json:"id"`
	EventID     string          `gorm:"not null;index" json:"event_id"`
	Name        string          `gorm:"not null" json:"name"`
	Game        string          `json:"game"`
	Source      constant.Source `gorm:"default:'manual'" json:"source"`
	ExternalID  string          `json:"external_id"`
	BracketType string          `json:"bracket_type"`
	Status      constant.Status `json:"status"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}
