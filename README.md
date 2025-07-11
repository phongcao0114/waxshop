# WaxShop - Ecommerce Platform

A full-stack ecommerce platform with a Java Spring Boot backend, Angular frontend, and MySQL database. Containerized with Docker for easy deployment and development. Currently deployed on AWS EC2.

---

## Quick Start (with Docker Compose)

1. **Prerequisites:**
   - [Docker](https://www.docker.com/products/docker-desktop) installed
2. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd waxshop
   ```
3. **Build & run everything:**
   ```sh
   docker-compose -f docker-compose.build.yml up --build
   ```
4. **Access the app:**
   - Frontend: [http://localhost:4200](http://localhost:4200)
   - Backend API: [http://localhost:8080](http://localhost:8080)
   - MySQL: `localhost:3306` (user: `root`, password: `YourStrong!Passw0rd`)

---

## Project Structure

```
waxshop/
├── backend/    # Spring Boot API (Java)
│   ├── src/    # Java source code (main & test)
│   ├── build.gradle  # Gradle build config
│   ├── Dockerfile    # Backend Docker image
│   ├── application.properties  # Backend config
│   └── db-init/      # DB initialization scripts (SQL)
├── frontend/   # Angular SPA
│   ├── src/    # Angular source code
│   ├── angular.json  # Angular CLI config
│   ├── Dockerfile    # Frontend Docker image
│   └── environment.ts  # Frontend config
├── docs/       # Documentation, DB scripts, API docs
├── docker-compose.yml # Legacy compose file
├── docker-compose.build.yml # Development compose file
├── docker-compose.deploy.yml # Production compose file
├── docker-compose.aws.yml # AWS deployment compose file
├── build-and-push.sh # Build and push to Docker Hub
├── deploy.sh # AWS deployment script
└── AWS_DEPLOYMENT.md # AWS deployment guide
```

### Main Folders & Key Files
- **backend/**: Spring Boot REST API, business logic, and DB integration
  - `src/`: Java source code (main & test)
  - `build.gradle`: Gradle build config
  - `Dockerfile`: Containerizes backend
  - `application.properties`: Spring Boot config
  - `db-init/`: SQL scripts for DB/table/data initialization
- **frontend/**: Angular SPA
  - `src/`: Angular source code
  - `angular.json`: Angular CLI config
  - `Dockerfile`: Containerizes frontend
  - `environment.ts`: Angular environment config
- **docs/**: API docs, DB schema, developer notes
- **docker-compose.build.yml**: Development environment orchestration
- **docker-compose.deploy.yml**: Production deployment orchestration
- **docker-compose.aws.yml**: AWS EC2 deployment orchestration

---

## Technologies Used
- **Backend:** Java 17+, Spring Boot, Gradle, JPA/Hibernate, JWT Authentication
- **Frontend:** Angular 16+, TypeScript, SCSS
- **Database:** MySQL 8.0
- **Other:** Docker, Docker Compose, JUnit/Mockito (testing), Node.js (frontend build)
- **Deployment:** AWS EC2, Docker Hub

---

## Getting Started: Step-by-Step

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop) installed
- (Optional for local dev) Java 17+ (backend), Node.js 18+ & npm (frontend)

### Clone the Repository
```sh
git clone <repo-url>
cd waxshop
```

### Build & Run Everything
```sh
docker-compose -f docker-compose.build.yml up --build
```
- To reset all data and re-initialize, use:
  ```sh
  docker-compose -f docker-compose.build.yml down -v && docker-compose -f docker-compose.build.yml up --build
  ```

### Access the App
- **Frontend:** [http://localhost:4200](http://localhost:4200)
- **Backend API:** [http://localhost:8080](http://localhost:8080)
- **MySQL:** `localhost:3306` (user: `root`, password: `YourStrong!Passw0rd`)

---

## Docker Compose Configurations

### Development (docker-compose.build.yml)
- **Orchestrates:**
  - `backend` (Spring Boot API, port 8080)
  - `frontend` (Angular app, port 4200)
  - `db` (MySQL 8.0, port 3306)
- **Builds and runs** backend and frontend containers from their respective Dockerfiles
- **Service dependencies:**
  - `backend` waits for `db` and DB initialization to be ready
  - `frontend` waits for `backend`
- **Volumes:**
  - MySQL data persisted in `mysql-data`
  - Backend `/uploads` mapped for product images
- **Networking:**
  - All services share a Docker network, accessible by service name (e.g., `db`)
- **Ports:**
  - 8080 (backend), 4200 (frontend), 3306 (MySQL) mapped to localhost

### Production (docker-compose.deploy.yml)
- Uses pre-built images from Docker Hub
- Optimized for production deployment
- Includes health checks and restart policies

### AWS Deployment (docker-compose.aws.yml)
- Configured for AWS EC2 deployment
- Uses external MySQL database
- Optimized for cloud environment

---

## Default Admin Account & Initial Data
On the **first run** (or after a full reset with `down -v`), the following are automatically created:
- **Admin Account:**
  - Email: `admin@admin.com`
  - Password: `admin123`
  - Name: `Admin 001`
  - Role: `ADMIN`
- **Category:**
  - Name: `Waxworks`
- **Products:**
  - 5 sample wax products, all linked to the `Waxworks` category (see `backend/db-init/init-db.sql` for details).

---

## Application Features

### User Features
- **Authentication:** JWT-based login/register system
- **Product Browsing:** View products by category
- **Shopping Cart:** Add/remove items, update quantities
- **Order Management:** Place orders, view order history
- **User Profile:** View and update personal information

### Admin Features
- **Dashboard:** Overview of users, products, orders, and categories
- **User Management:** View and manage user accounts
- **Product Management:** Add, edit, and delete products with image uploads
- **Category Management:** Create and manage product categories
- **Order Management:** View and update order statuses

### Technical Features
- **Security:** JWT authentication, role-based access control
- **File Upload:** Product image upload and storage
- **Database:** MySQL with automatic schema creation
- **API:** RESTful endpoints with proper error handling
- **Frontend:** Responsive Angular application with modern UI

---

## UI Features by Role
- **ADMIN**
  - Full access to admin dashboard
  - Manage users, categories, products, and orders
  - View and edit all data
- **USER**
  - Browse products and categories
  - Manage own cart and orders
  - View own profile

---

## Deployment

### Local Development
```sh
docker-compose -f docker-compose.build.yml up --build
```

### Production Build
```sh
docker-compose -f docker-compose.deploy.yml up -d
```

### AWS EC2 Deployment
See [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md) for detailed instructions.

**Current AWS Deployment:**
- **Frontend:** http://ec2-52-64-186-20.ap-southeast-2.compute.amazonaws.com
- **Backend API:** http://ec2-52-64-186-20.ap-southeast-2.compute.amazonaws.com:8080

---

## Notes
- The admin account and initial data are only created if the database is empty (first run or after `down -v`).
- To change the default admin password or initial data, edit `backend/db-init/init-db.sql` before starting the stack.
- The backend expects the database to be available at host `db` (see `docker-compose.build.yml`).
- All endpoints (except `/api/auth/*` and `/health`) require authentication. Admin endpoints require `ADMIN` role.
- Product images are stored in `backend/uploads/` and served by the backend.

---

## Useful Commands
- **Stop all containers:**
  ```sh
  docker-compose -f docker-compose.build.yml down
  ```
- **Rebuild after code changes:**
  ```sh
  docker-compose -f docker-compose.build.yml up --build
  ```
- **View logs:**
  ```sh
  docker-compose -f docker-compose.build.yml logs -f
  ```
- **Build and push to Docker Hub:**
  ```sh
  ./build-and-push.sh
  ```

---

## Local Development (Optional)
- **Backend:** Java 17+ required to run/test outside Docker
- **Frontend:** Node.js 18+ & npm required to run/test outside Docker

---

For more details, see the `/docs` folder or open an issue.