package dto

type CreateTournamentRequest struct {
	EventID string `json:"event_id"`
	Name    string `json:"name"`
	Game    string `json:"game"`
}

type UpdateTournamentRequest struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Game string `json:"game"`
}
