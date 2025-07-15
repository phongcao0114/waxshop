# WaxShop - Ecommerce Platform

A full-stack ecommerce platform built with Java Spring Boot backend, Angular frontend, and MySQL database. Containerized with Docker for easy deployment and development. Currently deployed on AWS EC2.

## 🚀 Quick Start

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop) installed

### Local Development
```bash
# Clone the repository
git clone <repo-url>
cd waxshop

# Build and run everything
docker-compose -f docker-compose.build.yml up --build

# Access the application
# Frontend: http://localhost:4200
# Backend API: http://localhost:8080
```

### AWS EC2 Testing
The application is currently deployed on AWS EC2:
- **Frontend:** http://ec2-52-64-186-20.ap-southeast-2.compute.amazonaws.com
- **Backend API:** http://ec2-52-64-186-20.ap-southeast-2.compute.amazonaws.com:8080

For deployment instructions, see [Deployment Guide](docs/DEPLOYMENT.md).

## 📋 Features by Role

### 👤 User Features
- **Authentication:** JWT-based login/register system
- **Product Browsing:** View products by category with search functionality
- **Shopping Cart:** Add/remove items, update quantities
- **Order Management:** Place orders, view order history
- **User Profile:** View and update personal information

### 👨‍💼 Admin Features
- **Dashboard:** Overview of users, products, orders, and categories
- **User Management:** View and manage user accounts
- **Product Management:** Add, edit, and delete products with image uploads
- **Category Management:** Create and manage product categories
- **Order Management:** View and update order statuses

### 🔧 Technical Features
- **Security:** JWT authentication, role-based access control
- **File Upload:** Product image upload and storage
- **Database:** MySQL with automatic schema creation
- **API:** RESTful endpoints with proper error handling
- **Frontend:** Responsive Angular application with modern UI

## 🏗️ Architecture

The application follows a modern microservices architecture:

- **Frontend:** Angular SPA with TypeScript and SCSS
- **Backend:** Spring Boot REST API with Java 17+
- **Database:** MySQL 8.0 with JPA/Hibernate
- **Containerization:** Docker and Docker Compose
- **Deployment:** AWS EC2 with Docker

For detailed architecture information, see [Architecture Overview](docs/ARCHITECTURE.md).

## 📚 Documentation

- **[Architecture Overview](docs/ARCHITECTURE.md)** - Detailed breakdown of frontend, backend, and database components
- **[API Documentation](docs/API.md)** - Complete API reference with request/response examples
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Instructions for local and AWS EC2 deployment

## 🛠️ Development

### Project Structure
```
waxshop/
├── backend/          # Spring Boot API (Java)
├── frontend/         # Angular SPA
├── docs/            # Documentation
├── docker-compose.*.yml  # Docker configurations
└── deploy.sh        # AWS deployment script
```

### Default Admin Account
On first run, the following admin account is automatically created:
- **Email:** `admin@admin.com`
- **Password:** `admin123`
- **Role:** `ADMIN`

### Useful Commands
```bash
# Stop all containers
docker-compose -f docker-compose.build.yml down

# Rebuild after code changes
docker-compose -f docker-compose.build.yml up --build

# View logs
docker-compose -f docker-compose.build.yml logs -f

# Build and push to Docker Hub
./build-and-push.sh
```

## 🔗 Links

- **Live Application:** http://ec2-52-64-186-20.ap-southeast-2.compute.amazonaws.com
- **API Documentation:** [docs/API.md](docs/API.md)
- **Deployment Guide:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Architecture Details:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with Docker Compose
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.