package repository

import (
	"zhago/internal/domain/model"
	"zhago/internal/dto"
)

type CommentatorRepository interface {
	Create(req *dto.CreateCommentatorRequest) (*model.Commentator, error)
	GetAll() ([]*model.Commentator, error)
	Delete(id string) error
}
