package event

import (
	"time"
	"zhago/internal/base"
	"zhago/internal/constant"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{
		db: db,
	}
}

func (r *Repository) Save(event *EventCreateDTO) (*Event, error) {
	newEvent := Event{
		BaseModel: base.BaseModel{
			Id: uuid.NewString(),
			Status: constant.StatusNew,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		Name: event.Name,
	}

	result := r.db.Create(newEvent)
	if result.Error != nil {
		return nil, result.Error
	}
	return &newEvent, nil
}

func (r *Repository) GetAll() ([]Event, error) {
	var events []Event
	result := r.db.Find(&events)
	if result.Error != nil {
		return nil, result.Error
	}
	return events, nil
}

