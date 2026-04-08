package dto

type CreateCommentatorRequest struct {
	Name     string `json:"name"`
	Handle   string `json:"handle"`
	Pronouns string `json:"pronouns"`
}
