package system

import (
	"zhago/internal/domain/model"
	"zhago/internal/dto"
	"zhago/internal/repository/sqlite"
	"zhago/internal/service"

	"gorm.io/gorm"
)

type CommentatorHandler struct {
	service service.CommentatorService
}

func NewCommentatorHandler(db *gorm.DB) *CommentatorHandler {
	repo := sqlite.NewCommentatorRepository(db)
	return &CommentatorHandler{service: *service.NewCommentatorService(repo)}
}

func (h *CommentatorHandler) CreateCommentator(req dto.CreateCommentatorRequest) (*model.Commentator, error) {
	return h.service.CreateCommentator(req)
}

func (h *CommentatorHandler) GetAll() ([]*model.Commentator, error) {
	return h.service.GetAll()
}

func (h *CommentatorHandler) DeleteCommentator(id string) error {
	return h.service.DeleteCommentator(id)
}
