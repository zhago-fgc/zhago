package model

import (
	"time"
	"zhago/internal/constant"
)

type BaseModel struct {
	ID 				string 					`json:"id"`
	Status    constant.Status `json:"status"`
	CreatedAt time.Time 			`json:"created_at"`
	UpdatedAt time.Time 			`json:"updated_at"`
}
