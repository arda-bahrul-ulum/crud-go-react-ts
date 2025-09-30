package model

import (
	"time"

	"gorm.io/gorm"
)

type Item struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"not null"`
	Description string         `json:"description"`
	Price       float64        `json:"price" gorm:"not null"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

type CreateItemRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" binding:"required,min=0"`
}

type UpdateItemRequest struct {
	Name        *string  `json:"name"`
	Description *string  `json:"description"`
	Price       *float64 `json:"price"`
}

type SearchItemRequest struct {
	Query   string  `form:"q" json:"query"`
	MinPrice float64 `form:"min_price" json:"min_price"`
	MaxPrice float64 `form:"max_price" json:"max_price"`
	Limit   int     `form:"limit" json:"limit"`
	Offset  int     `form:"offset" json:"offset"`
}

type SearchItemResponse struct {
	Items      []Item `json:"items"`
	Total      int64  `json:"total"`
	Limit      int    `json:"limit"`
	Offset     int    `json:"offset"`
	HasMore    bool   `json:"has_more"`
	TotalPages int    `json:"total_pages"`
}

type PaginatedItemResponse struct {
	Items      []Item `json:"items"`
	Total      int64  `json:"total"`
	Page       int    `json:"page"`
	Limit      int    `json:"limit"`
	TotalPages int    `json:"total_pages"`
	HasMore    bool   `json:"has_more"`
}
