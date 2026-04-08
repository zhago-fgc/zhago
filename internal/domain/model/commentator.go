package model

import "time"

type Commentator struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Handle    string    `json:"handle"`
	Pronouns  string    `json:"pronouns"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
