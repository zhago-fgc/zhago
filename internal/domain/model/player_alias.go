package model

import "zhago/internal/constant"

type PlayerAlias struct {
	ID         string          `gorm:"primaryKey" json:"id"`
	PlayerID   string          `gorm:"not null;index" json:"player_id"`
	Alias      string          `gorm:"not null" json:"alias"`
	Source     constant.Source `json:"source"`
	ExternalID string          `json:"external_id"`
}
