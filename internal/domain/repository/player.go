package repository

import (
	"zhago/internal/domain/model"
	"zhago/internal/dto"
)

type PlayerRepository interface {
	Create(req *dto.CreatePlayerRequest) (*model.Player, error)
	GetAll() ([]*model.Player, error)
	GetByID(id string) (*model.Player, error)
	Delete(id string) error
	GetAllStats() ([]*dto.PlayerStats, error)
}
