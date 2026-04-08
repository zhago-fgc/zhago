package repository

import (
	"zhago/internal/domain/model"
	"zhago/internal/dto"
)

type EventRepository interface {
	Create(request *dto.CreateEventRequest) error
	GetAll() ([]*model.Event, error)
	Delete(id string) error
}
