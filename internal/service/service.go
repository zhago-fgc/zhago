package service

import (
	"zhago/internal/dto"
	"zhago/internal/model"
	"zhago/internal/repository"
)

type EventService struct {
	repository repository.EventRepository
}

func NewEventService(repository repository.EventRepository) *EventService {
	return &EventService{
		repository: repository,
	}
}

func (s *EventService) CreateEvent(name string) (*model.Event, error) {
	event := dto.EventCreateDTO{
		Name: name,
	}

	return s.repository.Save(&event)
}
