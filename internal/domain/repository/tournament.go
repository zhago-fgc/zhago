package repository

import (
	"zhago/internal/domain/model"
	"zhago/internal/dto"
)

type TournamentRepository interface {
	Create(req *dto.CreateTournamentRequest) (*model.Tournament, error)
	GetAll() ([]*model.Tournament, error)
	GetByEvent(eventID string) ([]*model.Tournament, error)
	Update(req *dto.UpdateTournamentRequest) error
	Delete(id string) error
	SetActive(id string) error
}
