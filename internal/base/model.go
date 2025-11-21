package base

import (
	"time"
	"zhago/internal/constant"
)

type BaseModel struct {
	Id 				string 					`json:"id" gorm:"primaryKey"`
	Status    constant.Status `json:"status"`
	CreatedAt time.Time 			`json:"created_at"`
	UpdatedAt time.Time 			`json:"updated_at"`
}
