package service

import (
	"errors"
	"simple-crud-backend/internal/model"
	"simple-crud-backend/internal/repository"
)

type ItemService interface {
	CreateItem(req *model.CreateItemRequest) (*model.Item, error)
	GetItemByID(id uint) (*model.Item, error)
	GetAllItems() ([]model.Item, error)
	GetItemsWithPagination(page, limit int) (*model.PaginatedItemResponse, error)
	SearchItems(req *model.SearchItemRequest) (*model.SearchItemResponse, error)
	UpdateItem(id uint, req *model.UpdateItemRequest) (*model.Item, error)
	DeleteItem(id uint) error
	CheckImageUsage(imageURL string) (int64, error)
}

type itemService struct {
	itemRepo repository.ItemRepository
}

func NewItemService(itemRepo repository.ItemRepository) ItemService {
	return &itemService{itemRepo: itemRepo}
}

func (s *itemService) CreateItem(req *model.CreateItemRequest) (*model.Item, error) {
	item := &model.Item{
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		ImageURL:    req.ImageURL,
	}

	if err := s.itemRepo.Create(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *itemService) GetItemByID(id uint) (*model.Item, error) {
	return s.itemRepo.GetByID(id)
}

func (s *itemService) GetAllItems() ([]model.Item, error) {
	return s.itemRepo.GetAll()
}

func (s *itemService) GetItemsWithPagination(page, limit int) (*model.PaginatedItemResponse, error) {
	// Set default values
	if limit <= 0 {
		limit = 6
	}
	if page <= 0 {
		page = 1
	}

	offset := (page - 1) * limit

	// Get items with pagination
	items, err := s.itemRepo.GetAllWithPagination(limit, offset)
	if err != nil {
		return nil, err
	}

	// Get total count
	total, err := s.itemRepo.GetAllCount()
	if err != nil {
		return nil, err
	}

	// Calculate pagination info
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	hasMore := page < totalPages

	return &model.PaginatedItemResponse{
		Items:      items,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
		HasMore:    hasMore,
	}, nil
}

func (s *itemService) SearchItems(req *model.SearchItemRequest) (*model.SearchItemResponse, error) {
	// Set default values
	if req.Limit <= 0 {
		req.Limit = 10
	}
	if req.Offset < 0 {
		req.Offset = 0
	}

	var items []model.Item
	var total int64
	var err error

	// Check if price filter is applied
	if req.MinPrice > 0 || req.MaxPrice > 0 {
		// Search with price filter
		items, err = s.itemRepo.SearchWithPriceFilter(req.Query, req.MinPrice, req.MaxPrice, req.Limit, req.Offset)
		if err != nil {
			return nil, err
		}
		total, err = s.itemRepo.SearchWithPriceFilterCount(req.Query, req.MinPrice, req.MaxPrice)
		if err != nil {
			return nil, err
		}
	} else if req.Query != "" {
		// Regular search without price filter
		items, err = s.itemRepo.Search(req.Query, req.Limit, req.Offset)
		if err != nil {
			return nil, err
		}
		total, err = s.itemRepo.SearchCount(req.Query)
		if err != nil {
			return nil, err
		}
	} else {
		// No search query and no price filter - this shouldn't happen due to validation
		// but handle gracefully
		items = []model.Item{}
		total = 0
	}

	// Calculate pagination info
	totalPages := int((total + int64(req.Limit) - 1) / int64(req.Limit))
	hasMore := int64(req.Offset+req.Limit) < total

	return &model.SearchItemResponse{
		Items:      items,
		Total:      total,
		Limit:      req.Limit,
		Offset:     req.Offset,
		HasMore:    hasMore,
		TotalPages: totalPages,
	}, nil
}

func (s *itemService) UpdateItem(id uint, req *model.UpdateItemRequest) (*model.Item, error) {
	item, err := s.itemRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		item.Name = *req.Name
	}
	if req.Description != nil {
		item.Description = *req.Description
	}
	if req.Price != nil {
		if *req.Price < 0 {
			return nil, errors.New("price cannot be negative")
		}
		item.Price = *req.Price
	}
	if req.ImageURL != nil {
		item.ImageURL = *req.ImageURL
	}

	if err := s.itemRepo.Update(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *itemService) DeleteItem(id uint) error {
	return s.itemRepo.Delete(id)
}

func (s *itemService) CheckImageUsage(imageURL string) (int64, error) {
	return s.itemRepo.CountByImageURL(imageURL)
}
