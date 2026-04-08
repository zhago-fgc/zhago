package sqlite

import (
	"time"
	"zhago/internal/domain/model"
	"zhago/internal/dto"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CommentatorRepository struct {
	db *gorm.DB
}

func NewCommentatorRepository(db *gorm.DB) *CommentatorRepository {
	return &CommentatorRepository{db: db}
}

func (r *CommentatorRepository) Create(req *dto.CreateCommentatorRequest) (*model.Commentator, error) {
	c := &model.Commentator{
		ID:        uuid.NewString(),
		Name:      req.Name,
		Handle:    req.Handle,
		Pronouns:  req.Pronouns,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	return c, r.db.Create(c).Error
}

func (r *CommentatorRepository) GetAll() ([]*model.Commentator, error) {
	var commentators []*model.Commentator
	return commentators, r.db.Order("name asc").Find(&commentators).Error
}

func (r *CommentatorRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&model.Commentator{}).Error
}
