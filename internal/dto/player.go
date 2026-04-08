package dto

type CreatePlayerRequest struct {
	Tag    string `json:"tag"`
	Team   string `json:"team"`
	Region string `json:"region"`
}
