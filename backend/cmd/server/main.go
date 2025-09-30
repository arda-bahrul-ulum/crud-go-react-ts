package main

import (
	"log"
	"simple-crud-backend/internal/config"
	"simple-crud-backend/internal/db"
	"simple-crud-backend/server"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	database, err := db.InitDB(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run migrations
	if err := db.Migrate(database); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Start server
	router := server.SetupRouter(database)
	
	log.Printf("Server starting on %s:%s", cfg.ServerHost, cfg.ServerPort)
	if err := router.Run(":" + cfg.ServerPort); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
