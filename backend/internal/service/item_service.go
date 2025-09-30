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
	UpdateItem(id uint, req *model.UpdateItemRequest) (*model.Item, error)
	DeleteItem(id uint) error
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

	if err := s.itemRepo.Update(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *itemService) DeleteItem(id uint) error {
	return s.itemRepo.Delete(id)
}
