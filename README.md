# Romance of Europe - Parisian & Greek Statue Ecommerce Platform

## Introduction
Romance of Europe is a full-stack ecommerce platform inspired by Parisian and Greek styles, specializing in the sale of statues. The application features a modern Angular frontend, a robust Java Spring Boot backend, and a MySQL database. Users can browse a curated collection of statues, manage their shopping cart, and place orders. Admins can manage products, categories, and orders securely.

> **Tip:** Visit the Home page on the UI for an engaging overview and introduction to the app experience.

## Architecture / Structure Overview

### Frontend
- **Framework:** Angular (TypeScript, SCSS)
- **Responsibilities:**
  - User interface and experience
  - Product browsing, cart, and checkout flows
  - Admin dashboard for managing users, products, categories, and orders
  - Communicates with backend via REST API

### Backend
- **Tech Stack:** Java 17+, Spring Boot, JPA/Hibernate
- **Responsibilities:**
  - RESTful API for all business logic
  - Authentication (JWT), role-based access control
  - Order, product, user, and category management
  - File upload handling (product images)

### Database
- **Type:** MySQL 8.0
- **Structure Overview:**
  - Users (with roles: USER, ADMIN)
  - Products, Categories
  - Orders, Order Items
  - Cart
  - Schema auto-created on first run

## Features by Role

### User
- Register, login (JWT authentication)
- Browse/search products by category
- Manage shopping cart
- Place and view orders
- Update profile and password

### Admin
- Dashboard overview
- Manage users (view, update, enable/disable, delete)
- Manage products (add, edit, delete, upload images)
- Manage categories
- Manage and update orders

For a full list of API endpoints by role, see [README_API_BY_ROLE.md](README_API_BY_ROLE.md).

## Deployment Guide

### Local Deployment
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd waxshop
   ```
2. **Build and run with Docker Compose:**
   ```bash
   docker-compose -f docker-compose.build.yml up --build
   ```
3. **Access the application:**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:8080
4. **Stop containers:**
   ```bash
   docker-compose -f docker-compose.build.yml down
   ```
5. **Rebuild after code changes:**
   ```bash
   docker-compose -f docker-compose.build.yml up --build
   ```

### EC2 Deployment
1. **Build and push Docker images:**
   ```bash
   ./build-and-push.sh
   ```
2. **Run deploy script:**
   ```bash
   chmod +x deploy-ec2.sh
   ./deploy-ec2.sh
   ```
3. **Verify deployment:**
   - Frontend: [http://ec2-52-64-186-20.ap-southeast-2.compute.amazonaws.com/](http://ec2-52-64-186-20.ap-southeast-2.compute.amazonaws.com/)
   - Backend API: [http://ec2-52-64-186-20.ap-southeast-2.compute.amazonaws.com:8080](http://ec2-52-64-186-20.ap-southeast-2.compute.amazonaws.com:8080)

## Testing

### Local Testing
- Access the frontend and backend URLs in your browser.
- Use the default admin account to log in and test admin features.
- Register a new user and test user features (cart, orders, etc).

### EC2 Frontend and Backend Testing
- Visit the live application URL (see below).
- Test all user and admin flows as above.

### Accessing and Verifying the EC2 Database
- SSH into your EC2 instance.
- Use the MySQL CLI or a database tool to connect to the running MySQL container:
  ```bash
  docker exec -it <mysql-container-name> mysql -u root -p
  ```
- Check tables, users, orders, etc.

## Default Admin Account
- **Email:** `admin@admin.com`
- **Password:** `admin123`
- **Role:** `ADMIN`
- This account is created automatically on first run. Change the password after first login for security.

## Links
- **Live Application:** http://ec2-52-64-186-20.ap-southeast-2.compute.amazonaws.com
- **API Documentation:** [README_API_BY_ROLE.md](README_API_BY_ROLE.md)