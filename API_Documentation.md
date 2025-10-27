# E-commerce API Documentation

## 🌐 Base URL
```
http://localhost:5001
```


## 📚 Available Endpoints

### 🏠 Root Endpoint
- **GET** `/` - API information and available endpoints

---

## 🔐 Authentication

### Register User
- **POST** `/api/users/register`
- **Body Example:**
```json
{
  "name": "Yaroslav",
  "email": "yaroslav@example.com",
  "password": "123456"
}

- **Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "<UserID>",
    "name": "Yaroslav",
    "email": "yaroslav@example.com",
    "role": "user",
    "createdAt": "2025-10-27T00:00:00.000Z"
  },
  "token": "<JWT_TOKEN>"
}
```

### Login User
POST /api/users/login

Body Example:

{
  "email": "yaroslav@example.com",
  "password": "123456"
}
- **Response:**
{
  "message": "Login successful",
  "user": { "id": "<UserID>", "name": "Yaroslav", "role": "user" },
  "token": "<JWT_TOKEN>"
}


### Get Profile (Protected)
GET /api/users/profile

Headers: Authorization: Bearer <token>

Response Example:

{
  "id": "<UserID>",
  "name": "Yaroslav",
  "email": "yaroslav@example.com",
  "role": "user",
  "createdAt": "2025-10-27T00:00:00.000Z"
}

### Update Profile (Protected)
- **PUT** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "firstName": "Новеім'я",
  "lastName": "Новеприізвище",
  "phone": "+380509876543"
}
```

### Change Password (Protected)
- **PUT** `/api/auth/change-password`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

---

## 📦 Categories

### Get All Categories
Get All Categories

GET /api/categories

Response Example:

[
  {
    "_id": "<CategoryID>",
    "name": "Foundations",
    "description": "For all skin types",
    "createdAt": "2025-10-27T00:00:00.000Z"
  }
]

GET /api/categories/:id

Create Category (Admin Only)

POST /api/categories

Headers: Authorization: Bearer <admin-token>

Body Example:

{
  "name": "Foundations",
  "description": "For all skin types"
}

Update Category (Admin Only)

PUT /api/categories/:id

Headers: Authorization: Bearer <admin-token>

Body Example:

{
  "name": "Updated Category",
  "description": "Updated description"
}

Delete Category (Admin Only)

DELETE /api/categories/:id

Headers: Authorization: Bearer <admin-token>

Response Example:

{ "message": "Category deleted successfully" }

🛍 Products
Get All Products

GET /api/products

Query Parameters:

page (number, default: 1)

limit (number, default: 10)

category (slug, optional)

search (string, optional)

Response Example:

{
  "products": [
    {
      "_id": "<ProductID>",
      "name": "Light Foundation",
      "description": "Light tone",
      "price": 350,
      "stock": 20,
      "category": "<CategoryID>",
      "createdAt": "2025-10-27T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}

Get Product by ID

GET /api/products/:id

Create Product (Admin Only)

POST /api/products

Headers: Authorization: Bearer <admin-token>

Body Example:

{
  "name": "Light Foundation",
  "description": "Light tone",
  "price": 350,
  "category": "<CategoryID>",
  "stock": 20
}

Update Product (Admin Only)

PUT /api/products/:id

Headers: Authorization: Bearer <admin-token>

Body Example:

{
  "name": "Updated Product",
  "description": "Updated description",
  "price": 399,
  "stock": 15
}

Delete Product (Admin Only)

DELETE /api/products/:id

Headers: Authorization: Bearer <admin-token>

🛒 Orders
Get All Orders (Admin Only)

GET /api/orders

Headers: Authorization: Bearer <admin-token>

Create Order

POST /api/orders

Headers: Authorization: Bearer <token>

Body Example:

{
  "user": "<UserID>",
  "items": [
    { "product": "<ProductID>", "quantity": 2, "price": 350 }
  ],
  "totalPrice": 700
}

🔒 Authorization
Roles

user - Regular user (can view products, manage own orders)

admin - Administrator (can manage products, categories, view all orders)

Headers
Authorization: Bearer <token>

❌ Error Responses
Standard Error
{
  "error": "Error type",
  "message": "Detailed error message"
}

Validation Error Example
{
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}

HTTP Status Codes

200 - Success

201 - Created

400 - Bad Request

401 - Unauthorized

403 - Forbidden

404 - Not Found

500 - Internal Server Error

🚀 Quick Start Examples (curl)
Login as Admin
curl -X POST http://localhost:5001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

Get All Products
curl http://localhost:5001/api/products

Create Product (Admin Only)
curl -X POST http://localhost:5001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "name": "Test Product",
    "description": "Test Description",
    "price": 999.99,
    "stock": 10,
    "category": "<CategoryID>"
  }'

Create Order
curl -X POST http://localhost:5001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -d '{
    "user": "<UserID>",
    "items": [{"product": "<ProductID>", "quantity": 2, "price": 350}],
    "totalPrice": 700
  }'

