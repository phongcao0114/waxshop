# Architecture Overview

This document provides a detailed breakdown of the WaxShop ecommerce platform's architecture, explaining how the frontend, backend, and database components interact with each other.

## 🏗️ System Architecture

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐    JDBC    ┌─────────────────┐
│   Frontend      │ ◄──────────────► │    Backend      │ ◄─────────► │    Database     │
│   (Angular)     │                  │  (Spring Boot)  │            │    (MySQL)      │
│   Port: 4200    │                  │   Port: 8080    │            │   Port: 3306    │
└─────────────────┘                  └─────────────────┘            └─────────────────┘
```

## 🎨 Frontend (Angular SPA)

### Technology Stack
- **Framework:** Angular 16+ with TypeScript
- **Styling:** SCSS with responsive design
- **State Management:** Angular services with RxJS
- **HTTP Client:** Angular HttpClient for API communication
- **Routing:** Angular Router with guards

### Key Components

#### Core Structure
```
frontend/src/app/
├── admin/              # Admin dashboard & management
│   ├── admin-dashboard/
│   ├── admin-users/
│   ├── admin-products/
│   ├── admin-categories/
│   └── admin-orders/
├── auth/               # Authentication
│   ├── login/
│   ├── register/
│   └── auth.service.ts
├── components/         # Shared components
│   ├── navbar/
│   ├── cart/
│   ├── home/
│   └── footer/
├── guards/            # Route protection
├── shared/            # Shared utilities
└── user/              # User features
    └── user-profile/
```

#### Key Features
- **Role-based UI:** Navigation and features adapt based on user role (ADMIN/USER)
- **JWT Integration:** Automatic token handling and refresh
- **Error Handling:** Centralized error management with user-friendly messages
- **Loading States:** Visual feedback during API calls
- **Responsive Design:** Mobile-first approach

### Frontend-Backend Communication
- **API Base URL:** Configured in `environment.ts`
- **Authentication:** JWT tokens sent in Authorization header
- **Error Handling:** HTTP interceptors for global error management
- **CORS:** Configured on backend to allow frontend requests

## ⚙️ Backend (Spring Boot)

### Technology Stack
- **Framework:** Spring Boot 3.x with Java 17+
- **Build Tool:** Gradle
- **Database Access:** Spring Data JPA with Hibernate
- **Security:** Spring Security with JWT
- **File Handling:** Multipart file uploads
- **Testing:** JUnit 5 with Mockito

### Key Components

#### Package Structure
```
backend/src/main/java/com/example/demo/
├── config/            # Configuration classes
│   ├── WebConfig.java
│   └── SecurityConfig.java
├── controller/        # REST API endpoints
│   ├── AuthController.java
│   ├── ProductController.java
│   ├── CartController.java
│   ├── OrderController.java
│   └── UserController.java
├── service/          # Business logic
│   ├── AuthService.java
│   ├── ProductService.java
│   ├── CartService.java
│   └── OrderService.java
├── repository/       # Data access layer
│   ├── UserRepository.java
│   ├── ProductRepository.java
│   └── OrderRepository.java
├── entity/          # JPA entities
│   ├── User.java
│   ├── Product.java
│   └── Order.java
├── dto/             # Data transfer objects
├── security/        # JWT and security
└── exception/       # Error handling
```

#### API Endpoints Structure
```
/api/auth/*          # Authentication (login, register)
/api/users/*         # User management
/api/products/*      # Product operations
/api/cart/*          # Shopping cart
/api/orders/*        # Order management
/api/categories/*    # Category management
/api/admin/*         # Admin-only operations
```

#### Security Implementation
- **JWT Authentication:** Stateless token-based authentication
- **Role-based Access:** ADMIN and USER roles with different permissions
- **CORS Configuration:** Allows frontend requests
- **Password Encryption:** BCrypt for password hashing

### Backend-Database Communication
- **ORM:** Hibernate with JPA annotations
- **Connection Pool:** HikariCP for efficient database connections
- **Transactions:** Spring's declarative transaction management
- **Migration:** Automatic schema creation on startup

## 🗄️ Database (MySQL)

### Schema Design

#### Core Tables
```sql
-- Users table
users (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    name VARCHAR(255),
    role ENUM('USER', 'ADMIN'),
    created_at TIMESTAMP
)

-- Products table
products (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10,2),
    category_id BIGINT,
    image_url VARCHAR(255),
    created_at TIMESTAMP
)

-- Categories table
categories (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255),
    created_at TIMESTAMP
)

-- Cart items table
cart_items (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    product_id BIGINT,
    quantity INT,
    created_at TIMESTAMP
)

-- Orders table
orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    total_amount DECIMAL(10,2),
    status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'),
    created_at TIMESTAMP
)

-- Order items table
order_items (
    id BIGINT PRIMARY KEY,
    order_id BIGINT,
    product_id BIGINT,
    quantity INT,
    price DECIMAL(10,2)
)
```

#### Relationships
- **One-to-Many:** User → Orders, Category → Products
- **Many-to-Many:** Orders ↔ Products (via OrderItems)
- **One-to-Many:** User → CartItems

### Database Features
- **ACID Compliance:** Full transaction support
- **Indexing:** Optimized queries with proper indexes
- **Foreign Keys:** Referential integrity
- **Auto-increment:** Primary key generation

## 🔄 Component Interactions

### Authentication Flow
1. **Frontend** sends login credentials to `/api/auth/login`
2. **Backend** validates credentials against database
3. **Backend** generates JWT token and returns to frontend
4. **Frontend** stores token and includes in subsequent requests
5. **Backend** validates token on protected endpoints

### Product Management Flow
1. **Admin** creates/edits product via frontend
2. **Frontend** sends product data to `/api/admin/products`
3. **Backend** validates data and saves to database
4. **Database** stores product information
5. **Frontend** displays updated product list

### Order Processing Flow
1. **User** adds items to cart via frontend
2. **Frontend** sends cart updates to `/api/cart/*`
3. **Backend** manages cart state in database
4. **User** places order via frontend
5. **Backend** creates order and order items in database
6. **Admin** can view and update order status

## 🐳 Containerization

### Docker Architecture
```
┌─────────────────────────────────────────────────────────┐
│                 Docker Compose Network                 │
├─────────────────┬─────────────────┬───────────────────┤
│   Frontend      │    Backend      │     Database      │
│   Container     │   Container     │    Container      │
│   Port: 4200    │   Port: 8080    │   Port: 3306     │
└─────────────────┴─────────────────┴───────────────────┘
```

### Container Communication
- **Service Discovery:** Containers communicate via service names
- **Network Isolation:** All services on same Docker network
- **Volume Mounting:** Database persistence and file uploads
- **Health Checks:** Service availability monitoring

## 🔧 Configuration Management

### Environment Variables
- **Database:** Connection strings, credentials
- **JWT:** Secret keys, expiration times
- **File Upload:** Storage paths, size limits
- **CORS:** Allowed origins for frontend

### Configuration Files
- **Backend:** `application.properties` for Spring Boot config
- **Frontend:** `environment.ts` for API endpoints
- **Docker:** Multiple compose files for different environments

## 📊 Performance Considerations

### Frontend Optimization
- **Lazy Loading:** Angular modules loaded on demand
- **Image Optimization:** Compressed product images
- **Caching:** Browser caching for static assets
- **Bundle Size:** Tree-shaking and code splitting

### Backend Optimization
- **Database Indexing:** Optimized queries with proper indexes
- **Connection Pooling:** Efficient database connections
- **Caching:** Application-level caching where appropriate
- **Async Processing:** Non-blocking operations

### Database Optimization
- **Query Optimization:** Efficient SQL queries
- **Indexing Strategy:** Proper indexes on frequently queried columns
- **Connection Management:** Connection pooling and timeout handling

## 🔒 Security Architecture

### Authentication & Authorization
- **JWT Tokens:** Stateless authentication
- **Role-based Access:** ADMIN and USER permissions
- **Password Security:** BCrypt hashing
- **Session Management:** Token refresh mechanism

### Data Protection
- **Input Validation:** Server-side validation
- **SQL Injection Prevention:** Parameterized queries
- **XSS Protection:** Content Security Policy
- **CORS Configuration:** Controlled cross-origin requests

## 🚀 Deployment Architecture

### Local Development
- **Docker Compose:** All services in containers
- **Hot Reload:** Development with live code changes
- **Database Persistence:** Local volume mounting

### Production (AWS EC2)
- **Container Orchestration:** Docker Compose on EC2
- **Load Balancing:** Nginx reverse proxy (if needed)
- **Database:** External MySQL instance
- **File Storage:** Local storage with backup strategy

This architecture provides a scalable, maintainable, and secure ecommerce platform that can be easily deployed and extended. 