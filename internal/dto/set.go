package dto

type CreateSetRequest struct {
	TournamentID string `json:"tournament_id"`
	Player1ID    string `json:"player1_id"`
	Player2ID    string `json:"player2_id"`
	Round        string `json:"round"`
	BestOf       int    `json:"best_of"`
}

type UpdateSetScoreRequest struct {
	SetID        string `json:"set_id"`
	Player1Score int    `json:"player1_score"`
	Player2Score int    `json:"player2_score"`
}

type ReportSetRequest struct {
	SetID        string `json:"set_id"`
	WinnerID     string `json:"winner_id"`
	Player1Score int    `json:"player1_score"`
	Player2Score int    `json:"player2_score"`
}
