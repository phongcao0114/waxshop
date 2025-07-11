# EcommerceApp Backend API Documentation

This document provides grouped, detailed API documentation for both **User** and **Admin** roles, including
request/response examples and explanations for each endpoint.

---

# Backend API Reference

## User APIs (Role: USER or ADMIN)

### Authentication

- **Register**
  - **Role:** Public (no auth)
  - **Request:**
    `POST /api/auth/register`
    ```json
    { "email": "user@example.com", "password": "password123", "name": "John Doe", "phone": "0123456789" }
    ```
  - **Response:**
    `"User registered successfully"`
  - **Sample curl:**
    ```sh
    curl -X POST http://localhost:8080/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{"email":"user@example.com","password":"password123","name":"John Doe","phone":"0123456789"}'
    ```

- **Login**
  - **Role:** Public (no auth)
  - **Request:**
    `POST /api/auth/login`
    ```json
    { "email": "user@example.com", "password": "password123" }
    ```
  - **Response:**
    ```json
    {
      "token": "<jwt_token>",
      "refreshToken": "<refresh_token>",
      "role": "USER",
      "user": {
        "id": 1,
        "email": "user@example.com",
        "role": "USER",
        "name": "John Doe"
      }
    }
    ```
  - **Sample curl:**
    ```sh
    curl -X POST http://localhost:8080/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"user@example.com","password":"password123"}'
    ```

### User Profile

- **Get User Profile**
  - **Role:** USER/ADMIN (auth required)
  - **Request:**
    `GET /api/users/profile`
  - **Response:**
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
  - **Sample curl:**
    ```sh
    curl http://localhost:8080/api/users/profile \
      -H "Authorization: Bearer <user_token>"
    ```

- **Update User Profile**
  - **Role:** USER/ADMIN (auth required)
  - **Request:**
    `PUT /api/users/profile`
    ```json
    { "name": "John Doe", "address": "123 Main St", "phone": "1234567890" }
    ```
  - **Response:**
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
  - **Sample curl:**
    ```sh
    curl -X PUT http://localhost:8080/api/users/profile \
      -H "Authorization: Bearer <user_token>" \
      -H "Content-Type: application/json" \
      -d '{"name":"John Doe","address":"123 Main St","phone":"1234567890"}'
    ```

### Product APIs

- **List Products**
  - **Role:** USER/ADMIN (auth required)
  - **Request:**
    `GET /api/products`
  - **Response:**
    ```json
    [
      {
        "id": 5,
        "name": "Laptop X",
        "price": 1200.0,
        "category": { "id": 1, "name": "Laptops" },
        "imageUrl": "/uploads/1751012963616_product-image.png"
      }
    ]
    ```
  - **Sample curl:**
    ```sh
    curl http://localhost:8080/api/products \
      -H "Authorization: Bearer <user_token>"
    ```

- **Search Products**
    - Endpoint: `GET /api/products/search?query=test&page=0&size=5`
    - Description: Search products by name/description (requires authentication).
    - Request:
      ```bash
      curl "http://localhost:8080/api/products/search?query=test&page=0&size=5" -H "Authorization: Bearer <user_token>" -H "Content-Type: application/json"
      ```
    - Response:
      ```json
      [
        {
          "id": 5,
          "name": "Laptop X",
          "price": 1200.0,
          "category": { "id": 1, "name": "Laptops" },
          "imageUrl": "/uploads/1751012963616_product-image.png"
        }
      ]
      ```
    - Error Response (example):
      ```json
      { "error": "Unauthorized" }
      ```

- **Get Product Details**
  - **Role:** USER/ADMIN (auth required)
  - **Request:**
    `GET /api/products/{id}`
  - **Response:**
    ```json
    {
      "id": 5,
      "name": "Laptop X",
      "description": "A powerful laptop.",
      "price": 1200.0,
      "category": { "id": 1, "name": "Laptops" },
      "imageUrl": "/uploads/1751012963616_product-image.png"
    }
    ```
  - **Sample curl:**
    ```sh
    curl http://localhost:8080/api/products/5 \
      -H "Authorization: Bearer <user_token>"
    ```

### Cart APIs

- **Get Cart**
  - **Role:** USER/ADMIN (auth required)
  - **Request:**
    `GET /api/cart`
  - **Response:**
    ```json
    [
      {
        "productId": 5,
        "name": "Laptop X",
        "quantity": 2,
        "price": 1200.0
      }
    ]
    ```
  - **Sample curl:**
    ```sh
    curl http://localhost:8080/api/cart \
      -H "Authorization: Bearer <user_token>"
    ```

- **Add to Cart**
  - **Role:** USER/ADMIN (auth required)
  - **Request:**
    `POST /api/cart/add`
    ```json
    { "productId": 5, "quantity": 2 }
    ```
  - **Response:**
    ```json
    { "message": "Item added to cart" }
    ```
  - **Sample curl:**
    ```sh
    curl -X POST http://localhost:8080/api/cart/add \
      -H "Authorization: Bearer <user_token>" \
      -H "Content-Type: application/json" \
      -d '{"productId":5,"quantity":2}'
    ```

- **Update Cart Item**
  - **Role:** USER/ADMIN (auth required)
  - **Request:**
    `PUT /api/cart/update`
    ```json
    { "productId": 5, "quantity": 4 }
    ```
  - **Response:**
    ```json
    { "message": "Cart item updated" }
    ```
  - **Sample curl:**
    ```sh
    curl -X PUT http://localhost:8080/api/cart/update \
      -H "Authorization: Bearer <user_token>" \
      -H "Content-Type: application/json" \
      -d '{"productId":5,"quantity":4}'
    ```

- **Remove Cart Item**
  - **Role:** USER/ADMIN (auth required)
  - **Request:**
    `DELETE /api/cart/remove/{productId}`
  - **Response:**
    ```json
    { "message": "Item removed from cart" }
    ```
  - **Sample curl:**
    ```sh
    curl -X DELETE http://localhost:8080/api/cart/remove/6 \
      -H "Authorization: Bearer <user_token>"
    ```

### Order APIs

- **Place Order**
  - **Role:** USER/ADMIN (auth required)
  - **Request:**
    `POST /api/orders/place`
    ```json
    { "productIds": [6], "paymentMethod": "COD" }
    ```
  - **Response:**
    ```json
    {
      "orderId": 101,
      "status": "PLACED",
      "total": 2400.0,
      "items": [
        { "productId": 6, "name": "Laptop X", "quantity": 2, "price": 1200.0 }
      ]
    }
    ```
  - **Sample curl:**
    ```sh
    curl -X POST http://localhost:8080/api/orders/place \
      -H "Authorization: Bearer <user_token>" \
      -H "Content-Type: application/json" \
      -d '{"productIds":[6],"paymentMethod":"COD"}'
    ```

- **Get User Orders**
  - **Role:** USER/ADMIN (auth required)
  - **Request:**
    `GET /api/orders/user/{userId}`
  - **Response:**
    ```json
    [
      {
        "orderId": 101,
        "status": "PLACED",
        "total": 2400.0,
        "items": [
          { "productId": 6, "name": "Laptop X", "quantity": 2, "price": 1200.0 }
        ],
        "createdAt": "2025-06-30T10:00:00Z"
      }
    ]
    ```
  - **Sample curl:**
    ```sh
    curl http://localhost:8080/api/orders/user/1 \
      -H "Authorization: Bearer <user_token>"
    ```

- **Cancel Order**
  - **Role:** USER/ADMIN (auth required)
  - **Request:**
    `PATCH /api/orders/{orderId}/cancel`
  - **Response:**
    ```json
    { "message": "Order cancelled" }
    ```
  - **Sample curl:**
    ```sh
    curl -X PATCH http://localhost:8080/api/orders/3/cancel \
      -H "Authorization: Bearer <user_token>"
    ```

---

## Admin APIs (Role: ADMIN only)

### Category Management

- **List Categories**
  - **Role:** ADMIN
  - **Request:**
    `GET /api/admin/categories`
  - **Response:**
    ```json
    [
      { "id": 1, "name": "Laptops" },
      { "id": 2, "name": "Phones" }
    ]
    ```
  - **Sample curl:**
    ```sh
    curl http://localhost:8080/api/admin/categories \
      -H "Authorization: Bearer <admin_token>"
    ```

- **Get Category by ID**
  - **Role:** ADMIN
  - **Request:**
    `GET /api/admin/categories/{id}`
  - **Response:**
    ```json
    { "id": 1, "name": "Laptops" }
    ```
  - **Sample curl:**
    ```sh
    curl http://localhost:8080/api/admin/categories/1 \
      -H "Authorization: Bearer <admin_token>"
    ```

- **Create Category**
  - **Role:** ADMIN
  - **Request:**
    `POST /api/admin/categories`
    ```json
    { "name": "Laptops" }
    ```
  - **Response:**
    ```json
    { "id": 3, "name": "Laptops" }
    ```
  - **Sample curl:**
    ```sh
    curl -X POST http://localhost:8080/api/admin/categories \
      -H "Authorization: Bearer <admin_token>" \
      -H "Content-Type: application/json" \
      -d '{"name":"Laptops"}'
    ```

- **Update Category**
  - **Role:** ADMIN
  - **Request:**
    `PUT /api/admin/categories/{id}`
    ```json
    { "name": "Updated Category" }
    ```
  - **Response:**
    ```json
    { "id": 1, "name": "Updated Category" }
    ```
  - **Sample curl:**
    ```sh
    curl -X PUT http://localhost:8080/api/admin/categories/1 \
      -H "Authorization: Bearer <admin_token>" \
      -H "Content-Type: application/json" \
      -d '{"name":"Updated Category"}'
    ```

- **Delete Category**
  - **Role:** ADMIN
  - **Request:**
    `DELETE /api/admin/categories/{id}`
  - **Response:**
    ```json
    { "message": "Category deleted successfully" }
    ```
  - **Sample curl:**
    ```sh
    curl -X DELETE http://localhost:8080/api/admin/categories/1 \
      -H "Authorization: Bearer <admin_token>"
    ```

### Order Management

- **Get All Orders**
  - **Role:** ADMIN
  - **Request:**
    `GET /api/orders/all`
  - **Response:**
    ```json
    [ ... ]
    ```
  - **Sample curl:**
    ```sh
    curl http://localhost:8080/api/orders/all \
      -H "Authorization: Bearer <admin_token>"
    ```

- **Update Order Status**
  - **Role:** ADMIN
  - **Request:**
    `PATCH /api/orders/admin/{orderId}/status?status=NEW_STATUS`
  - **Response:**
    ```json
    { "message": "Order status updated" }
    ```
  - **Sample curl:**
    ```sh
    curl -X PATCH "http://localhost:8080/api/orders/admin/10003/status?status=SHIPPED" \
      -H "Authorization: Bearer <admin_token>"
    ```

### Admin Product Management

- **Add Product**
  - **Role:** ADMIN
  - **Request:**
    `POST /api/admin/products`  (multipart/form-data: dto, imageFile)
  - **Response:**
    ```json
    { "id": 10, "name": "New Product", ... }
    ```
  - **Sample curl:**
    ```sh
    curl -X POST http://localhost:8080/api/admin/products \
      -H "Authorization: Bearer <admin_token>" \
      -F "dto={...}" -F "imageFile=@/path/to/image.png"
    ```

- **Update Product**
  - **Role:** ADMIN
  - **Request:**
    `PUT /api/admin/products/{id}`  (multipart/form-data: dto, imageFile optional)
  - **Response:**
    ```json
    { "id": 10, "name": "Updated Product", ... }
    ```
  - **Sample curl:**
    ```sh
    curl -X PUT http://localhost:8080/api/admin/products/10 \
      -H "Authorization: Bearer <admin_token>" \
      -F "dto={...}" -F "imageFile=@/path/to/image.png"
    ```

---

### Health Check

- **Health Check**
  - **Role:** Public (no auth)
  - **Request:**
    `GET /health`
  - **Response:**
    ```json
    { "status": "ok" }
    ```
  - **Sample curl:**
    ```sh
    curl http://localhost:8080/health
    ```

---

> All endpoints (except `/api/auth/*` and `/health`) require authentication.  
> Admin endpoints require `ADMIN` role.
