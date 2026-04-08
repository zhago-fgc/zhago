package service

import (
	"zhago/internal/domain/model"
	"zhago/internal/domain/repository"
	"zhago/internal/dto"
)

type EventService struct {
	repo        repository.EventRepository
	tournRepo   repository.TournamentRepository
	setRepo     repository.SetRepository
}

func NewEventService(repo repository.EventRepository, tournRepo repository.TournamentRepository, setRepo repository.SetRepository) *EventService {
	return &EventService{repo: repo, tournRepo: tournRepo, setRepo: setRepo}
}

func (s *EventService) CreateEvent(req dto.CreateEventRequest) error {
	return s.repo.Create(&req)
}

func (s *EventService) GetAllEvents() ([]*model.Event, error) {
	return s.repo.GetAll()
}

func (s *EventService) DeleteEvent(id string) error {
	tournaments, err := s.tournRepo.GetByEvent(id)
	if err != nil {
		return err
	}
	for _, t := range tournaments {
		if err := s.setRepo.DeleteByTournament(t.ID); err != nil {
			return err
		}
		if err := s.tournRepo.Delete(t.ID); err != nil {
			return err
		}
	}
	return s.repo.Delete(id)
}
