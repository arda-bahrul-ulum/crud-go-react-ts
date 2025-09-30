package repository

import (
	"simple-crud-backend/internal/model"

	"gorm.io/gorm"
)

type ItemRepository interface {
	Create(item *model.Item) error
	GetByID(id uint) (*model.Item, error)
	GetAll() ([]model.Item, error)
	Update(item *model.Item) error
	Delete(id uint) error
}

type itemRepository struct {
	db *gorm.DB
}

func NewItemRepository(db *gorm.DB) ItemRepository {
	return &itemRepository{db: db}
}

func (r *itemRepository) Create(item *model.Item) error {
	return r.db.Create(item).Error
}

func (r *itemRepository) GetByID(id uint) (*model.Item, error) {
	var item model.Item
	err := r.db.First(&item, id).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *itemRepository) GetAll() ([]model.Item, error) {
	var items []model.Item
	err := r.db.Find(&items).Error
	return items, err
}

func (r *itemRepository) Update(item *model.Item) error {
	return r.db.Save(item).Error
}

func (r *itemRepository) Delete(id uint) error {
	return r.db.Delete(&model.Item{}, id).Error
}
