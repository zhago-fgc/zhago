package bolt

import (
	"encoding/json"
	"time"
	"zhago/internal/constant"
	"zhago/internal/domain/model"
	"zhago/internal/dto"

	"github.com/google/uuid"
	"go.etcd.io/bbolt"
)

type EventRepository struct {
	db *bbolt.DB
}

func NewEventRepository(db *bbolt.DB) *EventRepository {
	db.Update(func(tx *bbolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte("events"))
		return err
	})
 
	return &EventRepository{
		db: db,
	}
}

func (r *EventRepository) Create(request *dto.CreateEventRequest) error {
	newEvent := model.Event{
		ID:        uuid.NewString(),
		Status:    constant.StatusNew,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Name:      request.Name,
	}

	data, err := json.Marshal(newEvent)
	if err != nil {
		return err
	}

	err = r.db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte("events"))
		return b.Put([]byte(newEvent.ID), data)
	})

	return nil
}

func (r *EventRepository) GetAll() ([]*model.Event, error) {
	var events []*model.Event

	err := r.db.View(func(tx *bbolt.Tx) error {
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
