package model

type PlayerCharacter struct {
	ID        string `gorm:"primaryKey" json:"id"`
	PlayerID  string `gorm:"not null;index" json:"player_id"`
	Game      string `gorm:"not null" json:"game"`
	Character string `gorm:"not null" json:"character"`
}
