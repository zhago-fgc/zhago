package sqlite

import (
	"time"
	"zhago/internal/constant"
	"zhago/internal/domain/model"
	"zhago/internal/dto"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SetRepository struct {
	db *gorm.DB
}

func NewSetRepository(db *gorm.DB) *SetRepository {
	return &SetRepository{db: db}
}

func (r *SetRepository) Create(req *dto.CreateSetRequest) (*model.Set, error) {
	bestOf := req.BestOf
	if bestOf == 0 {
		bestOf = 3
	}
	s := &model.Set{
		ID:           uuid.NewString(),
		TournamentID: req.TournamentID,
		Player1ID:    req.Player1ID,
		Player2ID:    req.Player2ID,
		Round:        req.Round,
		BestOf:       bestOf,
		Status:       constant.StatusNew,
		CreatedAt:    time.Now(),
	}
	return s, r.db.Create(s).Error
}

func (r *SetRepository) GetByTournament(tournamentID string) ([]*model.Set, error) {
	var sets []*model.Set
	return sets, r.db.
		Preload("Player1").
		Preload("Player2").
		Preload("Winner").
		Where("tournament_id = ?", tournamentID).
		Find(&sets).Error
}

func (r *SetRepository) UpdateScore(req *dto.UpdateSetScoreRequest) error {
	return r.db.Model(&model.Set{}).
		Where("id = ?", req.SetID).
		Updates(map[string]any{
			"player1_score": req.Player1Score,
			"player2_score": req.Player2Score,
		}).Error
}

func (r *SetRepository) ReportResult(req *dto.ReportSetRequest) error {
	return r.db.Model(&model.Set{}).
		Where("id = ?", req.SetID).
		Updates(map[string]any{
			"winner_id":     req.WinnerID,
			"player1_score": req.Player1Score,
			"player2_score": req.Player2Score,
			"status":        constant.StatusCompleted,
		}).Error
}

func (r *SetRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&model.Set{}).Error
}

func (r *SetRepository) DeleteByTournament(tournamentID string) error {
	return r.db.Where("tournament_id = ?", tournamentID).Delete(&model.Set{}).Error
}
