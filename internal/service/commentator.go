package service

import (
	"zhago/internal/domain/model"
	"zhago/internal/domain/repository"
	"zhago/internal/dto"
)

type CommentatorService struct {
	repo repository.CommentatorRepository
}

func NewCommentatorService(repo repository.CommentatorRepository) *CommentatorService {
	return &CommentatorService{repo: repo}
}

func (s *CommentatorService) CreateCommentator(req dto.CreateCommentatorRequest) (*model.Commentator, error) {
	return s.repo.Create(&req)
}

func (s *CommentatorService) GetAll() ([]*model.Commentator, error) {
	return s.repo.GetAll()
}

func (s *CommentatorService) DeleteCommentator(id string) error {
	return s.repo.Delete(id)
}
