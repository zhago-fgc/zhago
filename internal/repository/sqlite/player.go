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

func (r *PlayerRepository) GetAllStats() ([]*dto.PlayerStats, error) {
	type row struct {
		PlayerID   string
		SetsPlayed int
		SetsWon    int
		GamesWon   int
		GamesLost  int
	}
	var rows []row
	err := r.db.Raw(`
		SELECT
			p.id AS player_id,
			COUNT(s.id) AS sets_played,
			SUM(CASE WHEN s.winner_id = p.id THEN 1 ELSE 0 END) AS sets_won,
			SUM(CASE WHEN s.player1_id = p.id THEN s.player1_score ELSE s.player2_score END) AS games_won,
			SUM(CASE WHEN s.player1_id = p.id THEN s.player2_score ELSE s.player1_score END) AS games_lost
		FROM players p
		LEFT JOIN sets s ON (s.player1_id = p.id OR s.player2_id = p.id) AND s.status = 'COMPLETED'
		GROUP BY p.id
	`).Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	stats := make([]*dto.PlayerStats, len(rows))
	for i, r := range rows {
		setsLost := r.SetsPlayed - r.SetsWon
		winRate := 0.0
		if r.SetsPlayed > 0 {
			winRate = float64(r.SetsWon) / float64(r.SetsPlayed) * 100
		}
		stats[i] = &dto.PlayerStats{
			PlayerID:   r.PlayerID,
			SetsPlayed: r.SetsPlayed,
			SetsWon:    r.SetsWon,
			SetsLost:   setsLost,
			WinRate:    winRate,
			GamesWon:   r.GamesWon,
			GamesLost:  r.GamesLost,
		}
	}
	return stats, nil
}
