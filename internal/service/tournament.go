package service

import (
	"zhago/internal/domain/model"
	"zhago/internal/domain/repository"
	"zhago/internal/dto"
)

type TournamentService struct {
	repo    repository.TournamentRepository
	setRepo repository.SetRepository
}

func NewTournamentService(repo repository.TournamentRepository, setRepo repository.SetRepository) *TournamentService {
	return &TournamentService{repo: repo, setRepo: setRepo}
}

func (s *TournamentService) CreateTournament(req dto.CreateTournamentRequest) (*model.Tournament, error) {
	return s.repo.Create(&req)
}

func (s *TournamentService) GetAll() ([]*model.Tournament, error) {
	return s.repo.GetAll()
}

func (s *TournamentService) GetByEvent(eventID string) ([]*model.Tournament, error) {
	return s.repo.GetByEvent(eventID)
}

func (s *TournamentService) UpdateTournament(req dto.UpdateTournamentRequest) error {
	return s.repo.Update(&req)
}

func (s *TournamentService) DeleteTournament(id string) error {
	if err := s.setRepo.DeleteByTournament(id); err != nil {
		return err
	}
	return s.repo.Delete(id)
}

func (s *TournamentService) ActivateTournament(id string) error {
	return s.repo.SetActive(id)
}
