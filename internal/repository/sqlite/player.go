package sqlite

import (
	"time"
	"zhago/internal/domain/model"
	"zhago/internal/dto"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PlayerRepository struct {
	db *gorm.DB
}

func NewPlayerRepository(db *gorm.DB) *PlayerRepository {
	return &PlayerRepository{db: db}
}

func (r *PlayerRepository) Create(req *dto.CreatePlayerRequest) (*model.Player, error) {
	p := &model.Player{
		ID:        uuid.NewString(),
		Tag:       req.Tag,
		Team:      req.Team,
		Region:    req.Region,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	return p, r.db.Create(p).Error
}

func (r *PlayerRepository) GetAll() ([]*model.Player, error) {
	var players []*model.Player
	return players, r.db.Find(&players).Error
}

func (r *PlayerRepository) GetByID(id string) (*model.Player, error) {
	var player model.Player
	return &player, r.db.Where("id = ?", id).First(&player).Error
}

func (r *PlayerRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&model.Player{}).Error
}
