package service

import (
	"zhago/internal/domain/model"
	"zhago/internal/domain/repository"
	"zhago/internal/dto"
)

type PlayerService struct {
	repo repository.PlayerRepository
}

func NewPlayerService(repo repository.PlayerRepository) *PlayerService {
	return &PlayerService{repo: repo}
}

func (s *PlayerService) CreatePlayer(req dto.CreatePlayerRequest) (*model.Player, error) {
	return s.repo.Create(&req)
}

func (s *PlayerService) GetAll() ([]*model.Player, error) {
	return s.repo.GetAll()
}

func (s *PlayerService) DeletePlayer(id string) error {
	return s.repo.Delete(id)
}
