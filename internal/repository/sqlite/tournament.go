package sqlite

import (
	"time"
	"zhago/internal/constant"
	"zhago/internal/domain/model"
	"zhago/internal/dto"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TournamentRepository struct {
	db *gorm.DB
}

func NewTournamentRepository(db *gorm.DB) *TournamentRepository {
	return &TournamentRepository{db: db}
}

func (r *TournamentRepository) Create(req *dto.CreateTournamentRequest) (*model.Tournament, error) {
	t := &model.Tournament{
		ID:        uuid.NewString(),
		EventID:   req.EventID,
		Name:      req.Name,
		Game:      req.Game,
		Source:    constant.SourceManual,
		Status:    constant.StatusNew,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	return t, r.db.Create(t).Error
}

func (r *TournamentRepository) GetAll() ([]*model.Tournament, error) {
	var tournaments []*model.Tournament
	return tournaments, r.db.Find(&tournaments).Error
}

func (r *TournamentRepository) GetByEvent(eventID string) ([]*model.Tournament, error) {
	var tournaments []*model.Tournament
	return tournaments, r.db.Where("event_id = ?", eventID).Find(&tournaments).Error
}

func (r *TournamentRepository) Update(req *dto.UpdateTournamentRequest) error {
	return r.db.Model(&model.Tournament{}).
		Where("id = ?", req.ID).
		Updates(map[string]interface{}{"name": req.Name, "game": req.Game}).Error
}

func (r *TournamentRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&model.Tournament{}).Error
}

func (r *TournamentRepository) SetActive(id string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&model.Tournament{}).
			Where("status = ?", constant.StatusActive).
			Update("status", constant.StatusNew).Error; err != nil {
			return err
		}
		return tx.Model(&model.Tournament{}).
			Where("id = ?", id).
			Update("status", constant.StatusActive).Error
	})
}
