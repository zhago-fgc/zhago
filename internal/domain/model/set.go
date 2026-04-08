package model

import (
	"time"
	"zhago/internal/constant"
)

type Set struct {
	ID           string          `gorm:"primaryKey" json:"id"`
	TournamentID string          `gorm:"not null;index" json:"tournament_id"`
	Player1ID    string          `gorm:"index" json:"player1_id"`
	Player2ID    string          `gorm:"index" json:"player2_id"`
	WinnerID     string          `json:"winner_id"`
	Player1Score int             `json:"player1_score"`
	Player2Score int             `json:"player2_score"`
	Round        string          `json:"round"`
	BestOf       int             `gorm:"default:3" json:"best_of"`
	Status       constant.Status `json:"status"`
	ExternalID   string          `json:"external_id"`
	Player1      *Player         `gorm:"foreignKey:Player1ID;references:ID" json:"player1,omitempty"`
	Player2      *Player         `gorm:"foreignKey:Player2ID;references:ID" json:"player2,omitempty"`
	Winner       *Player         `gorm:"foreignKey:WinnerID;references:ID" json:"winner,omitempty"`
	CreatedAt    time.Time       `json:"created_at"`
}
