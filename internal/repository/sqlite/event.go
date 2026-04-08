package sqlite

import (
	"time"
	"zhago/internal/constant"
	"zhago/internal/domain/model"
	"zhago/internal/dto"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EventRepository struct {
	db *gorm.DB
}

func NewEventRepository(db *gorm.DB) *EventRepository {
	return &EventRepository{db: db}
}

func (r *EventRepository) Create(request *dto.CreateEventRequest) error {
	event := model.Event{
		ID:        uuid.NewString(),
		Name:      request.Name,
		Status:    constant.StatusNew,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	return r.db.Create(&event).Error
}

func (r *EventRepository) GetAll() ([]*model.Event, error) {
	var events []*model.Event
	result := r.db.Find(&events)
	return events, result.Error
}

func (r *EventRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&model.Event{}).Error
}
