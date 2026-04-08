package model

import (
	"time"
	"zhago/internal/constant"
)

type Event struct {
	ID        string          `gorm:"primaryKey" json:"id"`
	Name      string          `gorm:"not null" json:"name"`
	Status    constant.Status `json:"status"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}
