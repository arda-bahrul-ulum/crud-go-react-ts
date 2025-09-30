package repository

import (
	"simple-crud-backend/internal/model"

	"gorm.io/gorm"
)

type ItemRepository interface {
	Create(item *model.Item) error
	GetByID(id uint) (*model.Item, error)
	GetAll() ([]model.Item, error)
	GetAllWithPagination(limit, offset int) ([]model.Item, error)
	GetAllCount() (int64, error)
	Search(query string, limit, offset int) ([]model.Item, error)
	SearchCount(query string) (int64, error)
	SearchWithPriceFilter(query string, minPrice, maxPrice float64, limit, offset int) ([]model.Item, error)
	SearchWithPriceFilterCount(query string, minPrice, maxPrice float64) (int64, error)
	Update(item *model.Item) error
	Delete(id uint) error
	CountByImageURL(imageURL string) (int64, error)
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

func (r *itemRepository) GetAllWithPagination(limit, offset int) ([]model.Item, error) {
	var items []model.Item
	err := r.db.Limit(limit).Offset(offset).Find(&items).Error
	return items, err
}

func (r *itemRepository) GetAllCount() (int64, error) {
	var count int64
	err := r.db.Model(&model.Item{}).Count(&count).Error
	return count, err
}

func (r *itemRepository) Update(item *model.Item) error {
	return r.db.Save(item).Error
}

func (r *itemRepository) Search(query string, limit, offset int) ([]model.Item, error) {
	var items []model.Item
	err := r.db.Where("name ILIKE ? OR description ILIKE ?", "%"+query+"%", "%"+query+"%").
		Limit(limit).
		Offset(offset).
		Find(&items).Error
	return items, err
}

func (r *itemRepository) SearchCount(query string) (int64, error) {
	var count int64
	err := r.db.Model(&model.Item{}).
		Where("name ILIKE ? OR description ILIKE ?", "%"+query+"%", "%"+query+"%").
		Count(&count).Error
	return count, err
}

func (r *itemRepository) SearchWithPriceFilter(query string, minPrice, maxPrice float64, limit, offset int) ([]model.Item, error) {
	var items []model.Item
	queryBuilder := r.db.Where("name ILIKE ? OR description ILIKE ?", "%"+query+"%", "%"+query+"%")
	
	// Add price filter
	if minPrice > 0 {
		queryBuilder = queryBuilder.Where("price >= ?", minPrice)
	}
	if maxPrice > 0 {
		queryBuilder = queryBuilder.Where("price <= ?", maxPrice)
	}
	
	err := queryBuilder.Limit(limit).Offset(offset).Find(&items).Error
	return items, err
}

func (r *itemRepository) SearchWithPriceFilterCount(query string, minPrice, maxPrice float64) (int64, error) {
	var count int64
	queryBuilder := r.db.Model(&model.Item{}).
		Where("name ILIKE ? OR description ILIKE ?", "%"+query+"%", "%"+query+"%")
	
	// Add price filter
	if minPrice > 0 {
		queryBuilder = queryBuilder.Where("price >= ?", minPrice)
	}
	if maxPrice > 0 {
		queryBuilder = queryBuilder.Where("price <= ?", maxPrice)
	}
	
	err := queryBuilder.Count(&count).Error
	return count, err
}

func (r *itemRepository) Delete(id uint) error {
	return r.db.Delete(&model.Item{}, id).Error
}

func (r *itemRepository) CountByImageURL(imageURL string) (int64, error) {
	var count int64
	err := r.db.Model(&model.Item{}).Where("image_url = ?", imageURL).Count(&count).Error
	return count, err
}
