package event

import "zhago/internal/base"

type Event struct {
	base.BaseModel
	Name 			string 					`gorm:"not null"`
}

