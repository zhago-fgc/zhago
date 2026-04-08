package dto

type PlayerStats struct {
	PlayerID   string  `json:"player_id"`
	SetsPlayed int     `json:"sets_played"`
	SetsWon    int     `json:"sets_won"`
	SetsLost   int     `json:"sets_lost"`
	WinRate    float64 `json:"win_rate"`
	GamesWon   int     `json:"games_won"`
	GamesLost  int     `json:"games_lost"`
}
