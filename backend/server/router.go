package server

import (
	"simple-crud-backend/internal/handler"
	"simple-crud-backend/internal/repository"
	"simple-crud-backend/internal/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRouter(db *gorm.DB) *gin.Engine {
	// Initialize repositories
	itemRepo := repository.NewItemRepository(db)

	// Initialize services
	itemService := service.NewItemService(itemRepo)

	// Initialize handlers
	itemHandler := handler.NewItemHandler(itemService)

	// Setup router
	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Static file serving for uploads
	router.Static("/uploads", "./uploads")

	// API routes
	api := router.Group("/api/v1")
	{
		items := api.Group("/items")
		{
			items.POST("", itemHandler.CreateItem)
			items.POST("/bulk", itemHandler.BulkCreateItems)
			items.GET("", itemHandler.GetAllItems)
			items.GET("/search", itemHandler.SearchItems)
			items.GET("/:id", itemHandler.GetItem)
			items.PUT("/:id", itemHandler.UpdateItem)
			items.DELETE("/:id", itemHandler.DeleteItem)
			items.POST("/:id/image", itemHandler.UpdateItemImage)
		}
		
		// Upload routes
		api.POST("/upload", itemHandler.UploadImage)
		api.DELETE("/upload", itemHandler.DeleteUploadedImage)
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	return router
}
