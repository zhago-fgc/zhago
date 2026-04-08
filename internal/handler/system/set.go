package system

import (
	"zhago/internal/domain/model"
	"zhago/internal/dto"
	"zhago/internal/repository/sqlite"
	"zhago/internal/service"

	"gorm.io/gorm"
)

type SetHandler struct {
	service service.SetService
}

func NewSetHandler(db *gorm.DB) *SetHandler {
	repo := sqlite.NewSetRepository(db)
	return &SetHandler{service: *service.NewSetService(repo)}
}

func (h *SetHandler) CreateSet(req dto.CreateSetRequest) (*model.Set, error) {
	return h.service.CreateSet(req)
}

func (h *SetHandler) GetByTournament(tournamentID string) ([]*model.Set, error) {
	return h.service.GetByTournament(tournamentID)
}

func (h *SetHandler) UpdateScore(req dto.UpdateSetScoreRequest) error {
	return h.service.UpdateScore(req)
}

func (h *SetHandler) ReportResult(req dto.ReportSetRequest) error {
	return h.service.ReportResult(req)
}

func (h *SetHandler) DeleteSet(id string) error {
	return h.service.DeleteSet(id)
}
