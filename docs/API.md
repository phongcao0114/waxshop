# API Documentation

This document provides a complete reference for the WaxShop ecommerce platform API, including request/response structures and sample curl commands for all endpoints.

## 🔐 Authentication

All endpoints except `/api/auth/*` and `/health` require authentication via JWT token in the Authorization header.

### Base URL
- **Local:** `http://localhost:8080`
- **Production:** `http://ec2-52-64-186-20.ap-southeast-2.compute.amazonaws.com:8080`

### Authentication Header Format
```bash
Authorization: Bearer <jwt_token>
```

---

## 📝 Public Endpoints (No Authentication Required)

### Health Check
**GET** `/health`
```bash
curl http://localhost:8080/health
```
**Response:**
```json
{
  "status": "UP",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🔑 Authentication Endpoints

### Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "0123456789"
}
```

**Sample curl:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "phone": "0123456789"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully"
}
```

### Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Sample curl:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "role": "USER",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "USER",
    "name": "John Doe"
  }
}
```

---

## 👤 User Profile Endpoints

### Get User Profile
**GET** `/api/users/profile`

**Sample curl:**
```bash
curl http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer <jwt_token>"
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "address": "123 Main St",
  "phone": "1234567890",
  "role": "USER"
}
```

### Update User Profile
**PUT** `/api/users/profile`

**Request Body:**
```json
{
  "name": "John Doe",
  "address": "123 Main St",
  "phone": "1234567890"
}
```

**Sample curl:**
```bash
curl -X PUT http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "address": "123 Main St",
    "phone": "1234567890"
  }'
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "address": "123 Main St",
  "phone": "1234567890",
  "role": "USER"
}
```

---

## 🛍️ Product Endpoints

### List Products
**GET** `/api/products`

**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 10)
- `category` (optional): Filter by category ID

**Sample curl:**
```bash
curl "http://localhost:8080/api/products?page=0&size=10" \
  -H "Authorization: Bearer <jwt_token>"
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Rose Wax",
    "description": "Beautiful rose-scented wax",
    "price": 15.99,
    "category": {
      "id": 1,
      "name": "Waxworks"
    },
    "imageUrl": "/uploads/1751899360976_1rose.png"
  }
]
```

### Search Products
**GET** `/api/products/search`

**Query Parameters:**
- `query` (required): Search term
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 10)

**Sample curl:**
```bash
curl "http://localhost:8080/api/products/search?query=rose&page=0&size=5" \
  -H "Authorization: Bearer <jwt_token>"
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Rose Wax",
    "description": "Beautiful rose-scented wax",
    "price": 15.99,
    "category": {
      "id": 1,
      "name": "Waxworks"
    },
    "imageUrl": "/uploads/1751899360976_1rose.png"
  }
]
```

### Get Product Details
**GET** `/api/products/{id}`

**Sample curl:**
```bash
curl http://localhost:8080/api/products/1 \
  -H "Authorization: Bearer <jwt_token>"
```

**Response:**
```json
{
  "id": 1,
  "name": "Rose Wax",
  "description": "Beautiful rose-scented wax with long-lasting fragrance",
  "price": 15.99,
  "category": {
    "id": 1,
    "name": "Waxworks"
  },
  "imageUrl": "/uploads/1751899360976_1rose.png"
}
```

---

## 🛒 Cart Endpoints

### Get Cart
**GET** `/api/cart`

**Sample curl:**
```bash
curl http://localhost:8080/api/cart \
  -H "Authorization: Bearer <jwt_token>"
```

**Response:**
```json
[
  {
    "productId": 1,
    "name": "Rose Wax",
    "quantity": 2,
    "price": 15.99,
    "totalPrice": 31.98
  }
]
```

### Add to Cart
**POST** `/api/cart/add`

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Sample curl:**
```bash
curl -X POST http://localhost:8080/api/cart/add \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 2
  }'
```

**Response:**
```json
{
  "message": "Item added to cart"
}
```

### Update Cart Item
**PUT** `/api/cart/update`

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 4
}
```

**Sample curl:**
```bash
curl -X PUT http://localhost:8080/api/cart/update \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 4
  }'
```

**Response:**
```json
{
  "message": "Cart item updated"
}
```

### Remove Cart Item
**DELETE** `/api/cart/remove/{productId}`

**Sample curl:**
```bash
curl -X DELETE http://localhost:8080/api/cart/remove/1 \
  -H "Authorization: Bearer <jwt_token>"
```

**Response:**
```json
{
  "message": "Item removed from cart"
}
```

---

## 📦 Order Endpoints

### Place Order
**POST** `/api/orders/place`

**Request Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

**Sample curl:**
```bash
curl -X POST http://localhost:8080/api/orders/place \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": 1,
        "quantity": 2
      }
    ]
  }'
```

**Response:**
```json
{
  "orderId": 1,
  "message": "Order placed successfully",
  "totalAmount": 31.98
}
```

### Get User Orders
**GET** `/api/orders`

**Sample curl:**
```bash
curl http://localhost:8080/api/orders \
  -H "Authorization: Bearer <jwt_token>"
```

**Response:**
```json
[
  {
    "id": 1,
    "totalAmount": 31.98,
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00Z",
    "items": [
      {
        "productId": 1,
        "name": "Rose Wax",
        "quantity": 2,
        "price": 15.99
      }
    ]
  }
]
```

### Get Order Details
**GET** `/api/orders/{orderId}`

**Sample curl:**
```bash
curl http://localhost:8080/api/orders/1 \
  -H "Authorization: Bearer <jwt_token>"
```

**Response:**
```json
{
  "id": 1,
  "totalAmount": 31.98,
  "status": "PENDING",
  "createdAt": "2024-01-15T10:30:00Z",
  "items": [
    {
      "productId": 1,
      "name": "Rose Wax",
      "quantity": 2,
      "price": 15.99
    }
  ]
}
```

---

## 🏷️ Category Endpoints

### List Categories
**GET** `/api/categories`

**Sample curl:**
```bash
curl http://localhost:8080/api/categories \
  -H "Authorization: Bearer <jwt_token>"
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Waxworks"
  }
]
```

---

## 👨‍💼 Admin Endpoints (ADMIN Role Required)

### Dashboard Statistics
**GET** `/api/admin/dashboard`

**Sample curl:**
```bash
curl http://localhost:8080/api/admin/dashboard \
  -H "Authorization: Bearer <admin_token>"
```

**Response:**
```json
{
  "totalUsers": 25,
  "totalProducts": 15,
  "totalOrders": 50,
  "totalCategories": 3,
  "recentOrders": [
    {
      "id": 1,
      "totalAmount": 31.98,
      "status": "PENDING",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### List All Users (Admin)
**GET** `/api/admin/users`

**Sample curl:**
```bash
curl http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer <admin_token>"
```

**Response:**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Create Product (Admin)
**POST** `/api/admin/products`

**Request Body (multipart/form-data):**
```
name: "New Wax Product"
description: "A new wax product"
price: 19.99
categoryId: 1
image: [file upload]
```

**Sample curl:**
```bash
curl -X POST http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer <admin_token>" \
  -F "name=New Wax Product" \
  -F "description=A new wax product" \
  -F "price=19.99" \
  -F "categoryId=1" \
  -F "image=@/path/to/image.png"
```

**Response:**
```json
{
  "id": 2,
  "name": "New Wax Product",
  "description": "A new wax product",
  "price": 19.99,
  "category": {
    "id": 1,
    "name": "Waxworks"
  },
  "imageUrl": "/uploads/1751899360976_newproduct.png"
}
```

### Update Product (Admin)
**PUT** `/api/admin/products/{id}`

**Request Body (multipart/form-data):**
```
name: "Updated Wax Product"
description: "An updated wax product"
price: 24.99
categoryId: 1
image: [file upload] (optional)
```

**Sample curl:**
```bash
curl -X PUT http://localhost:8080/api/admin/products/1 \
  -H "Authorization: Bearer <admin_token>" \
  -F "name=Updated Wax Product" \
  -F "description=An updated wax product" \
  -F "price=24.99" \
  -F "categoryId=1"
```

**Response:**
```json
{
  "id": 1,
  "name": "Updated Wax Product",
  "description": "An updated wax product",
  "price": 24.99,
  "category": {
    "id": 1,
    "name": "Waxworks"
  },
  "imageUrl": "/uploads/1751899360976_updatedproduct.png"
}
```

### Delete Product (Admin)
**DELETE** `/api/admin/products/{id}`

**Sample curl:**
```bash
curl -X DELETE http://localhost:8080/api/admin/products/1 \
  -H "Authorization: Bearer <admin_token>"
```

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

### Create Category (Admin)
**POST** `/api/admin/categories`

**Request Body:**
```json
{
  "name": "New Category"
}
```

**Sample curl:**
```bash
curl -X POST http://localhost:8080/api/admin/categories \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Category"
  }'
```

**Response:**
```json
{
  "id": 2,
  "name": "New Category"
}
```

### Update Category (Admin)
**PUT** `/api/admin/categories/{id}`

**Request Body:**
```json
{
  "name": "Updated Category"
}
```

**Sample curl:**
```bash
curl -X PUT http://localhost:8080/api/admin/categories/1 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Category"
  }'
```

**Response:**
```json
{
  "id": 1,
  "name": "Updated Category"
}
```

### Delete Category (Admin)
**DELETE** `/api/admin/categories/{id}`

**Sample curl:**
```bash
curl -X DELETE http://localhost:8080/api/admin/categories/1 \
  -H "Authorization: Bearer <admin_token>"
```

**Response:**
```json
{
  "message": "Category deleted successfully"
}
```

### List All Orders (Admin)
**GET** `/api/admin/orders`

**Sample curl:**
```bash
curl http://localhost:8080/api/admin/orders \
  -H "Authorization: Bearer <admin_token>"
```

**Response:**
```json
[
  {
    "id": 1,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    },
    "totalAmount": 31.98,
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00Z",
    "items": [
      {
        "productId": 1,
        "name": "Rose Wax",
        "quantity": 2,
        "price": 15.99
      }
    ]
  }
]
```

### Update Order Status (Admin)
**PUT** `/api/admin/orders/{orderId}/status`

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Sample curl:**
```bash
curl -X PUT http://localhost:8080/api/admin/orders/1/status \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONFIRMED"
  }'
```

**Response:**
```json
{
  "message": "Order status updated successfully"
}
```

---

## ❌ Error Responses

### Authentication Errors
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing token"
}
```

### Authorization Errors
```json
{
  "error": "Forbidden",
  "message": "Access denied. Admin role required."
}
```

### Validation Errors
```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    "Email is required",
    "Password must be at least 6 characters"
  ]
}
```

### Not Found Errors
```json
{
  "error": "Not Found",
  "message": "Product not found"
}
```

### Server Errors
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## 📊 Status Codes

- **200:** Success
- **201:** Created
- **400:** Bad Request
- **401:** Unauthorized
- **403:** Forbidden
- **404:** Not Found
- **500:** Internal Server Error

---

## 🔧 Testing with curl

### Get JWT Token
```bash
# Login to get token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}' | \
  jq -r '.token')

echo "Token: $TOKEN"
```

### Use Token in Requests
```bash
# Example: Get user profile
curl http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Test Admin Endpoints
```bash
# Get admin dashboard
curl http://localhost:8080/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- File uploads are limited to 10MB
- JWT tokens expire after 24 hours
- Admin endpoints require ADMIN role
- Product images are served from `/uploads/` endpoint
- Database uses MySQL with InnoDB engine
- All monetary values are in USD with 2 decimal places 