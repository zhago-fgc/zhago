package repository

import (
	"zhago/internal/domain/model"
	"zhago/internal/dto"
)

type SetRepository interface {
	Create(req *dto.CreateSetRequest) (*model.Set, error)
	GetByTournament(tournamentID string) ([]*model.Set, error)
	UpdateScore(req *dto.UpdateSetScoreRequest) error
	ReportResult(req *dto.ReportSetRequest) error
	Delete(id string) error
	DeleteByTournament(tournamentID string) error
}
