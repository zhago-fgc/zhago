package dto

type MessageRequest struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}

type UpdateMatchRequest struct {
	Player1Name  string `json:"player1Name"`
	Player1Team  string `json:"player1Team"`
	Player1Score int    `json:"player1Score"`
	Player2Name  string `json:"player2Name"`
	Player2Team  string `json:"player2Team"`
	Player2Score int    `json:"player2Score"`
	Round        string `json:"round"`
}
