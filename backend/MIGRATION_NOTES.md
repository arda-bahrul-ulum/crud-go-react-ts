# Database Migration Notes

## Image URL Column Addition

### Overview

Added `image_url` column to the `items` table to support image uploads for items.

### Changes Made

1. **Model Update** (`internal/model/item.go`):

   - Added `ImageURL string` field to `Item` struct
   - Added `ImageURL string` field to `CreateItemRequest` struct
   - Added `ImageURL *string` field to `UpdateItemRequest` struct

2. **Service Update** (`internal/service/item_service.go`):

   - Updated `CreateItem` to handle `ImageURL` field
   - Updated `UpdateItem` to handle `ImageURL` field

3. **Handler Update** (`internal/handler/item_handler.go`):

   - Added `UploadImage` handler for file uploads
   - Added file validation (type and size)
   - Added file storage in `uploads/` directory

4. **Router Update** (`server/router.go`):
   - Added `POST /api/v1/upload` route for image uploads
   - Added static file serving for `/uploads` directory

### Database Schema

```sql
-- items table structure after migration
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL,
    image_url VARCHAR(255),  -- NEW COLUMN
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

### Migration Commands

Migrations run automatically when starting the server:

```bash
# Start server (includes automatic migration)
go run cmd/server/main.go
```

The migration is handled by GORM AutoMigrate in the server startup process.

### File Upload Details

- **Supported formats**: JPEG, PNG, GIF, WebP
- **Max file size**: 5MB
- **Storage location**: `uploads/` directory
- **File naming**: `{timestamp}_item.{extension}`
- **URL format**: `/uploads/{filename}`

### Frontend Integration

- Image upload component in `ItemForm`
- Image display in `ItemDetailModal`
- Thumbnail display in `ItemList`
- File validation on frontend
- Preview functionality
