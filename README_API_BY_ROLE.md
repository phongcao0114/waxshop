# Backend API List by Role

This document lists backend API endpoints grouped by user role. Each entry includes the API name, path, description, request/response, and a sample curl command.

---

## Public APIs

### Register
- **Path:** `POST /api/auth/register`
- **Description:** Register a new user
- **Request:**
  ```json
  { "email": "user@example.com", "password": "string", ... }
  ```
- **Response:**
  ```json
  { "message": "User registered successfully" }
  ```
- **cURL:**
  ```sh
  curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"string"}'
  ```

### Login
- **Path:** `POST /api/auth/login`
- **Description:** User login
- **Request:**
  ```json
  { "email": "user@example.com", "password": "string" }
  ```
- **Response:**
  ```json
  { "accessToken": "...", "refreshToken": "..." }
  ```
- **cURL:**
  ```sh
  curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"string"}'
  ```

### Health Check
- **Path:** `GET /health`
- **Description:** Check server health
- **Response:**
  ```json
  { "status": "ok" }
  ```
- **cURL:**
  ```sh
  curl http://localhost:8080/health
  ```

---

## User APIs (Require Authentication)

### Get Profile
- **Path:** `GET /api/users/profile`
- **Description:** Get current user profile
- **Response:**
  ```json
  { "id": 1, "email": "user@example.com", ... }
  ```
- **cURL:**
  ```sh
  curl -H "Authorization: Bearer <token>" http://localhost:8080/api/users/profile
  ```

### Update Profile
- **Path:** `PUT /api/users/profile`
- **Description:** Update user profile
- **Request:**
  ```json
  { "name": "New Name", ... }
  ```
- **Response:**
  ```json
  { "id": 1, "email": "user@example.com", ... }
  ```
- **cURL:**
  ```sh
  curl -X PUT http://localhost:8080/api/users/profile -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"name":"New Name"}'
  ```

### Change Password
- **Path:** `PUT /api/users/profile/password`
- **Description:** Change user password
- **Request:**
  ```json
  { "oldPassword": "string", "newPassword": "string" }
  ```
- **Response:**
  ```json
  { "message": "Password updated successfully" }
  ```
- **cURL:**
  ```sh
  curl -X PUT http://localhost:8080/api/users/profile/password -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"oldPassword":"string","newPassword":"string"}'
  ```

### Product List
- **Path:** `GET /api/products`
- **Description:** List all products
- **Response:**
  ```json
  [ { "id": 1, "name": "...", ... }, ... ]
  ```
- **cURL:**
  ```sh
  curl http://localhost:8080/api/products
  ```

### Product Search
- **Path:** `GET /api/products/search?query=...`
- **Description:** Search products
- **Response:**
  ```json
  [ { "id": 1, "name": "...", ... }, ... ]
  ```
- **cURL:**
  ```sh
  curl "http://localhost:8080/api/products/search?query=keyword"
  ```

### Product Details
- **Path:** `GET /api/products/{id}`
- **Description:** Get product details
- **Response:**
  ```json
  { "id": 1, "name": "...", ... }
  ```
- **cURL:**
  ```sh
  curl http://localhost:8080/api/products/1
  ```

### Cart APIs
- **Add Item:** `POST /api/cart/add`
- **Get Cart:** `GET /api/cart`
- **Update Item:** `PUT /api/cart/update`
- **Remove Item:** `DELETE /api/cart/remove/{productId}`

Example cURL for Add Item:
```sh
curl -X POST http://localhost:8080/api/cart/add -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"productId":1,"quantity":2}'
```

### Order APIs
- **Place Order:** `POST /api/orders/place`
- **My Orders:** `GET /api/orders/my-orders`
- **Cancel Order:** `PATCH /api/orders/{orderId}/cancel`
- **Mark Delivered:** `PATCH /api/orders/{orderId}/delivered`

Example cURL for Place Order:
```sh
curl -X POST http://localhost:8080/api/orders/place -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"cartItems":[{"productId":1,"quantity":2}]}'
```

---

## Admin APIs (Require Admin Role)

### Register Admin
- **Path:** `POST /api/auth/admin/register`
- **Description:** Register a new admin
- **Request:**
  ```json
  { "email": "admin@example.com", "password": "string" }
  ```
- **Response:**
  ```json
  { "message": "Admin registered successfully" }
  ```
- **cURL:**
  ```sh
  curl -X POST http://localhost:8080/api/auth/admin/register -H "Authorization: Bearer <admin_token>" -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"string"}'
  ```

### User Management
- **List Users:** `GET /api/admin/users`
- **Get User:** `GET /api/admin/users/{id}`
- **Update User:** `PUT /api/admin/users/{id}`
- **Delete User:** `DELETE /api/admin/users/{id}`
- **Disable/Enable User:** `PATCH /api/admin/users/{id}/disable` / `PATCH /api/admin/users/{id}/enable`

Example cURL for List Users:
```sh
curl -H "Authorization: Bearer <admin_token>" http://localhost:8080/api/admin/users
```

### Category Management
- **List Categories:** `GET /api/admin/categories`
- **Get Category:** `GET /api/admin/categories/{id}`
- **Create Category:** `POST /api/admin/categories`
- **Update Category:** `PUT /api/admin/categories/{id}`
- **Delete Category:** `DELETE /api/admin/categories/{id}`

Example cURL for Create Category:
```sh
curl -X POST http://localhost:8080/api/admin/categories -H "Authorization: Bearer <admin_token>" -H "Content-Type: application/json" -d '{"name":"New Category"}'
```

### Product Management
- **Add Product:** `POST /api/admin/products`
- **Update Product:** `PUT /api/admin/products/{id}`
- **Delete Product:** `DELETE /api/admin/products/{id}`

Example cURL for Add Product:
```sh
curl -X POST http://localhost:8080/api/admin/products -H "Authorization: Bearer <admin_token>" -F "dto={\"name\":\"Product\",...}" -F "imageFile=@/path/to/image.png"
```

### Order Management
- **List All Orders:** `GET /api/orders/all`
- **List Orders by Status:** `GET /api/orders/all/status/{status}`
- **Update Order Status:** `PATCH /api/orders/admin/{orderId}/status?status=...`

Example cURL for Update Order Status:
```sh
curl -X PATCH "http://localhost:8080/api/orders/admin/1/status?status=SHIPPED" -H "Authorization: Bearer <admin_token>"
```

---

**Note:** Replace `<token>` and `<admin_token>` with your actual JWT access tokens. 