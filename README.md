# Simple CRUD Application

Aplikasi CRUD sederhana yang dibangun dengan **Go (Golang)** sebagai backend dan **React + TypeScript** sebagai frontend. Aplikasi ini mengimplementasikan arsitektur Clean Architecture dan menggunakan PostgreSQL sebagai database.

## 🏗️ Arsitektur Aplikasi

```
┌─────────────────┐    HTTP/REST API    ┌─────────────────┐
│   Frontend      │ ←─────────────────→ │   Backend       │
│   (React + TS)  │                     │   (Go + Gin)    │
└─────────────────┘                     └─────────────────┘
                                               │
                                               ▼
                                        ┌─────────────────┐
                                        │   PostgreSQL    │
                                        │   Database      │
                                        └─────────────────┘
```

## 📁 Struktur Project

```
simple-crud/
├── backend/                 # Backend Go Application
│   ├── cmd/server/         # Entry point aplikasi
│   ├── internal/           # Kode internal aplikasi
│   │   ├── config/         # Konfigurasi aplikasi
│   │   ├── db/             # Database connection & migration
│   │   ├── handler/        # HTTP handlers (Controllers)
│   │   ├── model/          # Data models & DTOs
│   │   ├── repository/     # Data access layer
│   │   └── service/        # Business logic layer
│   ├── server/             # Router & middleware
│   ├── go.mod              # Go module dependencies
│   ├── go.sum              # Dependency checksums
│   └── Dockerfile          # Container configuration
├── frontend/               # Frontend React Application
│   ├── src/                # Source code
│   │   ├── pages/          # React components (pages)
│   │   ├── api.ts          # API client functions
│   │   ├── types.ts        # TypeScript type definitions
│   │   ├── App.tsx         # Main App component
│   │   └── main.tsx        # React entry point
│   ├── package.json        # Node.js dependencies
│   ├── vite.config.ts      # Vite configuration
│   └── index.html          # HTML template
├── docker-compose.yml      # Docker services configuration
└── README.md              # Dokumentasi project
```

---

## 🚀 Backend (Go + Gin)

### Teknologi yang Digunakan

- **Go 1.23** - Programming language
- **Gin** - Web framework untuk HTTP server
- **GORM** - Object-Relational Mapping
- **PostgreSQL** - Database
- **Docker** - Containerization

### Arsitektur Clean Architecture

```
┌─────────────────┐
│   HTTP Layer    │ ← Handlers (Controllers)
├─────────────────┤
│  Business Layer │ ← Services (Business Logic)
├─────────────────┤
│   Data Layer    │ ← Repositories (Data Access)
├─────────────────┤
│  Database Layer │ ← GORM + PostgreSQL
└─────────────────┘
```

### 1. **cmd/server/main.go** - Application Entry Point

```go
func main() {
    // 1. Load configuration
    cfg := config.Load()

    // 2. Initialize database
    database, err := db.InitDB(cfg)

    // 3. Run migrations
    db.Migrate(database)

    // 4. Start server
    router := server.SetupRouter(database)
    router.Run(":" + cfg.ServerPort)
}
```

**Penjelasan:**

- **Entry point** aplikasi Go
- **Lifecycle**: Config → Database → Migration → Server
- **Dependency injection** database ke router

### 2. **internal/config/config.go** - Configuration Management

```go
type Config struct {
    DBHost     string  // Database host
    DBPort     string  // Database port
    DBUser     string  // Database user
    DBPassword string  // Database password
    DBName     string  // Database name
    ServerPort string  // Server port
    ServerHost string  // Server host
    Env        string  // Environment
}
```

**Fitur:**

- **Environment variables** management
- **Default values** untuk development
- **godotenv** untuk load `.env` file
- **Centralized configuration** untuk seluruh aplikasi

### 3. **internal/model/item.go** - Data Models

```go
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
```

**Penjelasan:**

- **Item struct**: Model database dengan GORM tags
- **JSON tags**: Untuk serialization/deserialization
- **GORM tags**: Database constraints dan relationships
- **Request structs**: DTOs untuk API input validation
- **Pointer fields**: Untuk optional updates

### 4. **internal/repository/item_repo.go** - Data Access Layer

```go
type ItemRepository interface {
    Create(item *model.Item) error
    GetByID(id uint) (*model.Item, error)
    GetAll() ([]model.Item, error)
    Update(item *model.Item) error
    Delete(id uint) error
}
```

**Fitur:**

- **Repository Pattern**: Abstraksi data access
- **Interface**: Contract untuk repository
- **GORM operations**: CRUD operations
- **Dependency injection**: Database di-inject ke repository

### 5. **internal/service/item_service.go** - Business Logic Layer

```go
type ItemService interface {
    CreateItem(req *model.CreateItemRequest) (*model.Item, error)
    GetItemByID(id uint) (*model.Item, error)
    GetAllItems() ([]model.Item, error)
    UpdateItem(id uint, req *model.UpdateItemRequest) (*model.Item, error)
    DeleteItem(id uint) error
}
```

**Fitur:**

- **Business logic** layer
- **Validation**: Business rules (e.g., price cannot be negative)
- **Repository dependency**: Menggunakan repository interface
- **Error handling**: Business logic error handling

### 6. **internal/handler/item_handler.go** - HTTP Controllers

```go
func (h *ItemHandler) CreateItem(c *gin.Context) {
    var req model.CreateItemRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    item, err := h.itemService.CreateItem(&req)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, item)
}
```

**Fitur:**

- **HTTP handlers** untuk REST API
- **Gin context**: Request/response handling
- **JSON binding**: Request body validation
- **HTTP status codes**: Proper status code responses
- **Error handling**: HTTP error responses

### 7. **server/router.go** - API Routes & Middleware

```go
func SetupRouter(db *gorm.DB) *gin.Engine {
    // Dependency injection
    itemRepo := repository.NewItemRepository(db)
    itemService := service.NewItemService(itemRepo)
    itemHandler := handler.NewItemHandler(itemService)

    // Router setup
    router := gin.Default()

    // CORS middleware
    router.Use(func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "*")
        // ... CORS headers
    })

    // API routes
    api := router.Group("/api/v1")
    {
        items := api.Group("/items")
        {
            items.POST("", itemHandler.CreateItem)      // POST /api/v1/items
            items.GET("", itemHandler.GetAllItems)      // GET /api/v1/items
            items.GET("/:id", itemHandler.GetItem)      // GET /api/v1/items/:id
            items.PUT("/:id", itemHandler.UpdateItem)   // PUT /api/v1/items/:id
            items.DELETE("/:id", itemHandler.DeleteItem) // DELETE /api/v1/items/:id
        }
    }
}
```

**API Endpoints:**

- `POST /api/v1/items` - Membuat item baru
- `GET /api/v1/items` - Mengambil semua item
- `GET /api/v1/items/:id` - Mengambil item berdasarkan ID
- `PUT /api/v1/items/:id` - Update item
- `DELETE /api/v1/items/:id` - Hapus item
- `GET /health` - Health check

---

## ⚛️ Frontend (React + TypeScript)

### Teknologi yang Digunakan

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool dan development server
- **Axios** - HTTP client
- **CSS3** - Styling

### Arsitektur Frontend

```
┌─────────────────┐
│   Components    │ ← React Components (UI)
├─────────────────┤
│   API Layer     │ ← Axios HTTP Client
├─────────────────┤
│   Types         │ ← TypeScript Definitions
└─────────────────┘
```

### 1. **src/types.ts** - TypeScript Type Definitions

```typescript
export interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface CreateItemRequest {
  name: string;
  description: string;
  price: number;
}

export interface UpdateItemRequest {
  name?: string;
  description?: string;
  price?: number;
}
```

**Fitur:**

- **Type safety** untuk seluruh aplikasi
- **Interface definitions** untuk data models
- **Request/Response types** untuk API calls

### 2. **src/api.ts** - API Client

```typescript
const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getItems = async (): Promise<Item[]> => {
  const response = await api.get("/items");
  return response.data;
};

export const createItem = async (data: CreateItemRequest): Promise<Item> => {
  const response = await api.post("/items", data);
  return response.data;
};
```

**Fitur:**

- **Axios instance** dengan konfigurasi default
- **Type-safe API functions** untuk semua CRUD operations
- **Error handling** otomatis
- **Promise-based** async operations

### 3. **src/pages/ItemForm.tsx** - Form Component

```typescript
const ItemForm: React.FC<ItemFormProps> = ({ item, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (item) {
        await updateItem(item.id, formData);
      } else {
        await createItem(formData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item");
    } finally {
      setLoading(false);
    }
  };
};
```

**Fitur:**

- **Controlled components** untuk form inputs
- **State management** dengan useState
- **Form validation** dan error handling
- **Loading states** untuk UX yang baik
- **Conditional rendering** untuk create/edit mode

### 4. **src/pages/ItemList.tsx** - List Component

```typescript
const ItemList: React.FC<ItemListProps> = ({ onEdit, onDelete }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getItems();
        setItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteItem(id);
        setItems(items.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item");
      }
    }
  };
};
```

**Fitur:**

- **Data fetching** dengan useEffect
- **State management** untuk items list
- **CRUD operations** dengan API calls
- **Confirmation dialogs** untuk delete operations
- **Error handling** dan user feedback

### 5. **src/App.tsx** - Main Application Component

```typescript
const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Simple CRUD App</h1>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          Add New Item
        </button>
      </header>

      <main className="app-main">
        <ItemList onEdit={handleEdit} onDelete={() => {}} />
      </main>

      {showForm && <ItemForm item={editingItem} onClose={handleCloseForm} />}
    </div>
  );
};
```

**Fitur:**

- **State management** untuk modal dan editing
- **Component composition** dengan ItemList dan ItemForm
- **Event handling** untuk user interactions
- **Conditional rendering** untuk modal

---

## 🐳 Docker Configuration

### docker-compose.yml

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: crud_go_ts
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: postgres123
      DB_NAME: crud_go_ts
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Fitur:**

- **PostgreSQL** database service
- **Backend** Go application
- **Frontend** React application
- **Service dependencies** dan networking
- **Volume persistence** untuk database

---

## 🚀 Cara Menjalankan Aplikasi

### Prerequisites

- Docker dan Docker Compose
- Node.js 18+ (untuk development frontend)
- Go 1.23+ (untuk development backend)

### 1. Menggunakan Docker (Production)

```bash
# Clone repository
git clone <repository-url>
cd simple-crud

# Jalankan semua services
docker-compose up --build

# Aplikasi akan tersedia di:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Database: localhost:5432
```

### 2. Development Mode (Hot Reload)

#### Backend dengan Air (Hot Reload)

```bash
cd backend

# Install dependencies
go mod download

# Install Air (jika belum terinstall)
go install github.com/air-verse/air@latest

# Jalankan dengan hot reload
air

# Atau menggunakan script
# Windows:
run-dev.bat
# Linux/Mac:
./run-dev.sh
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm start
# atau
npm run dev
```

### 3. Development Mode (Manual Restart)

#### Backend

```bash
cd backend

# Install dependencies
go mod download

# Jalankan aplikasi (perlu restart manual)
go run cmd/server/main.go
```

---

## 📚 Konsep yang Dipelajari

### Backend (Go)

- **Clean Architecture** dan **Repository Pattern**
- **Dependency Injection** dan **Interface Segregation**
- **GORM ORM** dan **Database Migrations**
- **RESTful API** design
- **Error Handling** dan **HTTP Status Codes**
- **CORS** dan **Middleware**

### Frontend (React)

- **Component-Based Architecture**
- **React Hooks** (useState, useEffect)
- **TypeScript** untuk type safety
- **Controlled Components** untuk forms
- **Async Operations** dengan async/await
- **Error Handling** dan **Loading States**
- **Event Handling** dan **State Management**

### Full-Stack

- **API Integration** antara frontend dan backend
- **Docker** containerization
- **Database Design** dan **CRUD Operations**
- **Environment Configuration**
- **Development Workflow**

---

## 🔧 API Documentation

### Base URL

```
http://localhost:8080/api/v1
```

### Endpoints

#### Items

| Method | Endpoint        | Description     | Request Body                                                   | Response             |
| ------ | --------------- | --------------- | -------------------------------------------------------------- | -------------------- |
| GET    | `/items`        | Get all items   | -                                                              | `Item[]`             |
| GET    | `/items/search` | Search items    | Query params: `q`, `min_price`, `max_price`, `limit`, `offset` | `SearchItemResponse` |
| GET    | `/items/:id`    | Get item by ID  | -                                                              | `Item`               |
| POST   | `/items`        | Create new item | `CreateItemRequest`                                            | `Item`               |
| PUT    | `/items/:id`    | Update item     | `UpdateItemRequest`                                            | `Item`               |
| DELETE | `/items/:id`    | Delete item     | -                                                              | `{message: string}`  |

#### Health Check

| Method | Endpoint  | Description  | Response         |
| ------ | --------- | ------------ | ---------------- |
| GET    | `/health` | Health check | `{status: "ok"}` |

### Request/Response Examples

#### Create Item

```bash
POST /api/v1/items
Content-Type: application/json

{
  "name": "Laptop",
  "description": "Gaming laptop",
  "price": 15000000
}
```

#### Response

```json
{
  "id": 1,
  "name": "Laptop",
  "description": "Gaming laptop",
  "price": 15000000,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Search Items

```bash
# Basic search
GET /api/v1/items/search?q=laptop&limit=10&offset=0

# Search with price filter
GET /api/v1/items/search?q=laptop&min_price=1000000&max_price=5000000&limit=10&offset=0

# Search with only minimum price
GET /api/v1/items/search?q=laptop&min_price=2000000&limit=10&offset=0

# Search with only maximum price
GET /api/v1/items/search?q=laptop&max_price=3000000&limit=10&offset=0
```

#### Search Response

```json
{
  "items": [
    {
      "id": 1,
      "name": "Laptop",
      "description": "Gaming laptop",
      "price": 15000000,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0,
  "has_more": false,
  "total_pages": 1
}
```

---

## 🎯 Fitur Aplikasi

- ✅ **Create** - Membuat item baru
- ✅ **Read** - Melihat daftar item dan detail item
- ✅ **Update** - Mengedit item yang sudah ada
- ✅ **Delete** - Menghapus item
- ✅ **Search** - Pencarian server-side dengan pagination
- ✅ **Price Filter** - Filter berdasarkan rentang harga (min/max)
- ✅ **Form Validation** - Validasi input form
- ✅ **Error Handling** - Penanganan error yang baik
- ✅ **Loading States** - Indikator loading
- ✅ **Responsive Design** - Tampilan yang responsif
- ✅ **Type Safety** - TypeScript untuk type safety
- ✅ **Docker Support** - Containerization
- ✅ **Hot Reload** - Development dengan Air untuk backend

---

## 📝 Kesimpulan

Aplikasi ini adalah contoh implementasi **full-stack CRUD application** yang menggunakan:

- **Backend**: Go dengan Clean Architecture, GORM, dan Gin
- **Frontend**: React dengan TypeScript dan modern hooks
- **Database**: PostgreSQL
- **Containerization**: Docker dan Docker Compose

Aplikasi ini mengikuti **best practices** dalam pengembangan web modern dan dapat digunakan sebagai **template** untuk proyek yang lebih besar.
