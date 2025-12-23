package model

import (
	"time"
	"zhago/internal/constant"
)

type Event struct {
	ID        string          `json:"id"`
	Name      string          `json:"name"`
	Status    constant.Status `json:"status"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}
