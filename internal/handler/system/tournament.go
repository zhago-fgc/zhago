package system

import (
	"zhago/internal/domain/model"
	"zhago/internal/dto"
	"zhago/internal/repository/sqlite"
	"zhago/internal/service"

	"gorm.io/gorm"
)

type TournamentHandler struct {
	service service.TournamentService
}

func NewTournamentHandler(db *gorm.DB) *TournamentHandler {
	repo := sqlite.NewTournamentRepository(db)
	setRepo := sqlite.NewSetRepository(db)
	return &TournamentHandler{service: *service.NewTournamentService(repo, setRepo)}
}

func (h *TournamentHandler) CreateTournament(req dto.CreateTournamentRequest) (*model.Tournament, error) {
	return h.service.CreateTournament(req)
}

func (h *TournamentHandler) GetAll() ([]*model.Tournament, error) {
	return h.service.GetAll()
}

func (h *TournamentHandler) GetByEvent(eventID string) ([]*model.Tournament, error) {
	return h.service.GetByEvent(eventID)
}

func (h *TournamentHandler) UpdateTournament(req dto.UpdateTournamentRequest) error {
	return h.service.UpdateTournament(req)
}

func (h *TournamentHandler) DeleteTournament(id string) error {
	return h.service.DeleteTournament(id)
}

func (h *TournamentHandler) ActivateTournament(id string) error {
	return h.service.ActivateTournament(id)
}
