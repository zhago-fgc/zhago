package dto

type MessageRequest struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}

type UpdateMatchRequest struct {
	Player1Name      string `json:"player1Name"`
	Player1Team      string `json:"player1Team"`
	Player1Score     int    `json:"player1Score"`
	Player1Character string `json:"player1Character"`
	Player2Name      string `json:"player2Name"`
	Player2Team      string `json:"player2Team"`
	Player2Score     int    `json:"player2Score"`
	Player2Character string `json:"player2Character"`
	Round            string `json:"round"`
	BestOf           int    `json:"bestOf"`
}
