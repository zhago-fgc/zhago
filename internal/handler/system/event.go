package system

import (
	"zhago/internal/domain/model"
	"zhago/internal/dto"
	"zhago/internal/repository/sqlite"
	"zhago/internal/service"

	"gorm.io/gorm"
)

type EventHandler struct {
	service service.EventService
}

func NewEventHandler(db *gorm.DB) *EventHandler {
	repo := sqlite.NewEventRepository(db)
	tournRepo := sqlite.NewTournamentRepository(db)
	setRepo := sqlite.NewSetRepository(db)
	svc := service.NewEventService(repo, tournRepo, setRepo)
	return &EventHandler{service: *svc}
}

func (h *EventHandler) CreateEvent(req dto.CreateEventRequest) error {
	return h.service.CreateEvent(req)
}

func (h *EventHandler) GetAllEvents() ([]*model.Event, error) {
	return h.service.GetAllEvents()
}

func (h *EventHandler) DeleteEvent(id string) error {
	return h.service.DeleteEvent(id)
}
