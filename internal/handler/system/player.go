package system

import (
	"zhago/internal/domain/model"
	"zhago/internal/dto"
	"zhago/internal/repository/sqlite"
	"zhago/internal/service"

	"gorm.io/gorm"
)

type PlayerHandler struct {
	service service.PlayerService
}

func NewPlayerHandler(db *gorm.DB) *PlayerHandler {
	repo := sqlite.NewPlayerRepository(db)
	return &PlayerHandler{service: *service.NewPlayerService(repo)}
}

func (h *PlayerHandler) CreatePlayer(req dto.CreatePlayerRequest) (*model.Player, error) {
	return h.service.CreatePlayer(req)
}

func (h *PlayerHandler) GetAll() ([]*model.Player, error) {
	return h.service.GetAll()
}

func (h *PlayerHandler) DeletePlayer(id string) error {
	return h.service.DeletePlayer(id)
}

func (h *PlayerHandler) GetAllStats() ([]*dto.PlayerStats, error) {
	return h.service.GetAllStats()
}
