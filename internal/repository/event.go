package repository

import (
	"encoding/json"
	"time"
	"zhago/internal/constant"
	"zhago/internal/dto"
	"zhago/internal/model"

	"github.com/google/uuid"
	bolt "go.etcd.io/bbolt"
)

type EventRepository struct {
	db *bolt.DB
}

func NewEventRepository(db *bolt.DB) *EventRepository {
	return &EventRepository{
		db: db,
	}
}

func (r *EventRepository) Save(event *dto.EventCreateDTO) (*model.Event, error) {
	newEvent := model.Event{
		BaseModel: model.BaseModel{
			ID:        uuid.NewString(),
			Status:    constant.StatusNew,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		Name: event.Name,
	}

	data, err := json.Marshal(newEvent)
	if err != nil {
		return nil, err
	}

	err = r.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("events"))
		return b.Put([]byte(newEvent.ID), data)
	})

	return &newEvent, err
}

func (r *EventRepository) GetAll() ([]*model.Event, error) {
	var events []*model.Event

	err := r.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("events"))
		return b.ForEach(func(k, v []byte) error {
			var event model.Event
			if err := json.Unmarshal(v, &event); err != nil {
				return err
			}
			events = append(events, &event)
			return nil
		})
	})

	return events, err
}
