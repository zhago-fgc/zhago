package service

import (
	"zhago/internal/domain/model"
	"zhago/internal/domain/repository"
	"zhago/internal/dto"
)

type SetService struct {
	repo repository.SetRepository
}

func NewSetService(repo repository.SetRepository) *SetService {
	return &SetService{repo: repo}
}

func (s *SetService) CreateSet(req dto.CreateSetRequest) (*model.Set, error) {
	return s.repo.Create(&req)
}

func (s *SetService) GetByTournament(tournamentID string) ([]*model.Set, error) {
	return s.repo.GetByTournament(tournamentID)
}

func (s *SetService) UpdateScore(req dto.UpdateSetScoreRequest) error {
	return s.repo.UpdateScore(&req)
}

func (s *SetService) ReportResult(req dto.ReportSetRequest) error {
	return s.repo.ReportResult(&req)
}

func (s *SetService) DeleteSet(id string) error {
	return s.repo.Delete(id)
}
