package dto

type CreateEventRequest struct {
	Name string `json:"name"`
}

type GetEventResponse struct {
	Name string `json:"name"`
}
