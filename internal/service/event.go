package service

import (
	"zhago/internal/domain/model"
	"zhago/internal/domain/repository"
	"zhago/internal/dto"
)

type EventService struct {
	repo repository.EventRepository
}

func NewEventService(repo repository.EventRepository) *EventService {
	return &EventService{repo}
}

func (s *EventService) CreateEvent(req dto.EventCreateDTO) error {
	return s.repo.Create(&req)
}

func (s *EventService) GetAllEvents() ([]*model.Event, error) {
	events, err := s.repo.GetAll()
	if err != nil {
		return nil, err
	}

	return events, nil
}
