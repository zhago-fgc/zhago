package repository

import (
	"zhago/internal/domain/model"
	"zhago/internal/dto"
)

type EventRepository interface {
	Create(request *dto.EventCreateDTO) error
	GetAll() ([]*model.Event, error)
}
