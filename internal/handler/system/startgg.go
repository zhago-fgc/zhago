package system

import (
	"zhago/internal/service"

	"gorm.io/gorm"
)

type StartGGHandler struct {
	service *service.StartGGImportService
}

func NewStartGGHandler(db *gorm.DB) *StartGGHandler {
	return &StartGGHandler{service: service.NewStartGGImportService(db)}
}

// ImportTournament imports a start.gg tournament into Zhago.
// url is a full start.gg URL (e.g. https://start.gg/tournament/the-fight-2026).
// token is the user's start.gg API token from Developer Settings.
func (h *StartGGHandler) ImportTournament(url, token string) error {
	return h.service.ImportTournament(url, token)
}
