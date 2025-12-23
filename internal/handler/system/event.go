package system

import (
	"zhago/internal/domain/model"
	"zhago/internal/dto"
	"zhago/internal/repository/bolt"
	"zhago/internal/service"

	"go.etcd.io/bbolt"
)

type EventHandler struct {
	service service.EventService
}

func NewEventHandler(db *bbolt.DB) *EventHandler {
	repo := bolt.NewEventRepository(db)
	service := service.NewEventService(repo)
	return &EventHandler{
		service: *service,
	}
}

func (h *EventHandler) CreateEvent(req dto.EventCreateDTO) error {
	if err := h.service.CreateEvent(req); err != nil {
		return err
	}
	return nil
}

func (h *EventHandler) GetAllEvents() ([]*model.Event, error) {
	res, err := h.service.GetAllEvents()
	if err != nil {
		return nil, err
	}
	return res, nil
}
