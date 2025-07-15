# Deployment Guide

This guide provides detailed instructions for deploying the WaxShop ecommerce platform both locally and on AWS EC2.

## 🏠 Local Deployment

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop) installed
- [Docker Compose](https://docs.docker.com/compose/) (usually included with Docker Desktop)
- At least 4GB RAM available
- 10GB free disk space

### Quick Start (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd waxshop
   ```

2. **Build and run with Docker Compose:**
   ```bash
   docker-compose -f docker-compose.build.yml up --build
   ```

3. **Access the application:**
   - **Frontend:** http://localhost:4200
   - **Backend API:** http://localhost:8080
   - **Database:** localhost:3306 (MySQL)

### Detailed Local Setup

#### Step 1: Environment Preparation
```bash
# Ensure Docker is running
docker --version
docker-compose --version

# Create necessary directories (if not exists)
mkdir -p backend/uploads
mkdir -p mysql-data
```

#### Step 2: Build and Deploy
```bash
# Build all services
docker-compose -f docker-compose.build.yml build

# Start all services
docker-compose -f docker-compose.build.yml up -d

# View logs
docker-compose -f docker-compose.build.yml logs -f
```

#### Step 3: Verify Deployment
```bash
# Check if all containers are running
docker-compose -f docker-compose.build.yml ps

# Test backend health
curl http://localhost:8080/health

# Test frontend (should return HTML)
curl http://localhost:4200
```

### Local Development Commands

#### Useful Docker Commands
```bash
# Stop all services
docker-compose -f docker-compose.build.yml down

# Stop and remove volumes (resets database)
docker-compose -f docker-compose.build.yml down -v

# Rebuild after code changes
docker-compose -f docker-compose.build.yml up --build

# View logs for specific service
docker-compose -f docker-compose.build.yml logs backend

# Access container shell
docker-compose -f docker-compose.build.yml exec backend bash
```

#### Database Management
```bash
# Access MySQL container
docker-compose -f docker-compose.build.yml exec db mysql -u root -p

# Backup database
docker-compose -f docker-compose.build.yml exec db mysqldump -u root -p waxshop > backup.sql

# Restore database
docker-compose -f docker-compose.build.yml exec -T db mysql -u root -p waxshop < backup.sql
```

### Local Configuration

#### Environment Variables
The application uses the following default configuration:

**Backend (`backend/src/main/resources/application.properties`):**
```properties
# Database
spring.datasource.url=jdbc:mysql://db:3306/waxshop
spring.datasource.username=root
spring.datasource.password=YourStrong!Passw0rd

# JWT
jwt.secret=your-secret-key
jwt.expiration=86400000

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

**Frontend (`frontend/src/environments/environment.ts`):**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

#### Default Admin Account
On first run, the following admin account is automatically created:
- **Email:** `admin@admin.com`
- **Password:** `admin123`
- **Role:** `ADMIN`

---

## ☁️ AWS EC2 Deployment

### Prerequisites
- AWS account with EC2 access
- EC2 instance running Ubuntu 20.04 or later
- SSH key pair for EC2 access
- Docker and Docker Compose installed on EC2

### EC2 Instance Setup

#### Step 1: Launch EC2 Instance
1. **Instance Type:** t2.micro (free tier) or t2.small for production
2. **AMI:** Ubuntu Server 20.04 LTS
3. **Storage:** 20GB GP2 EBS volume
4. **Security Group:** Configure ports 22 (SSH), 80 (HTTP), 8080 (Backend)

#### Step 2: Install Docker on EC2
```bash
# Connect to EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### Step 3: Configure Security Groups
Ensure these ports are open in your EC2 security group:
- **Port 22:** SSH (for management)
- **Port 80:** HTTP (frontend)
- **Port 8080:** HTTP (backend API)
- **Port 3306:** MySQL (if using external database)

### Deployment Process

#### Step 1: Build and Push Docker Images
From your local machine:
```bash
# Build and push to Docker Hub
./build-and-push.sh

# Verify images are pushed
docker images | grep waxshop
```

#### Step 2: Copy Deployment Files to EC2
```bash
# Copy deployment script
scp -i your-key.pem deploy.sh ubuntu@your-ec2-ip:~/

# Copy Docker Compose configuration
scp -i your-key.pem docker-compose.aws.yml ubuntu@your-ec2-ip:~/

# Copy database initialization files
scp -i your-key.pem -r backend/db-init ubuntu@your-ec2-ip:~/

# Copy uploaded product images (if any)
scp -i your-key.pem -r backend/uploads ubuntu@your-ec2-ip:~/temp-uploads/
```

#### Step 3: Deploy on EC2
```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### AWS Deployment Configuration

#### Docker Compose for AWS (`docker-compose.aws.yml`)
```yaml
version: '3.8'
services:
  frontend:
    image: your-dockerhub-username/waxshop-frontend:latest
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    image: your-dockerhub-username/waxshop-backend:latest
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://your-rds-endpoint:3306/waxshop
      - SPRING_DATASOURCE_USERNAME=your-db-username
      - SPRING_DATASOURCE_PASSWORD=your-db-password
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
```

#### Deployment Script (`deploy.sh`)
```bash
#!/bin/bash

# Stop existing containers
docker-compose -f docker-compose.aws.yml down

# Remove old images
docker system prune -f

# Pull latest images
docker-compose -f docker-compose.aws.yml pull

# Start services
docker-compose -f docker-compose.aws.yml up -d

# Wait for services to be ready
sleep 30

# Check service status
docker-compose -f docker-compose.aws.yml ps

echo "Deployment completed!"
```

### Database Setup

#### Option 1: Local MySQL Container
```yaml
# Add to docker-compose.aws.yml
db:
  image: mysql:8.0
  environment:
    MYSQL_ROOT_PASSWORD: YourStrong!Passw0rd
    MYSQL_DATABASE: waxshop
  volumes:
    - mysql-data:/var/lib/mysql
    - ./db-init:/docker-entrypoint-initdb.d
  ports:
    - "3306:3306"
```

#### Option 2: AWS RDS (Recommended for Production)
1. **Create RDS Instance:**
   - Engine: MySQL 8.0
   - Instance: db.t3.micro (free tier) or larger
   - Storage: 20GB GP2
   - Security Group: Allow port 3306 from EC2

2. **Update Configuration:**
   ```properties
   spring.datasource.url=jdbc:mysql://your-rds-endpoint:3306/waxshop
   spring.datasource.username=your-rds-username
   spring.datasource.password=your-rds-password
   ```

### Production Considerations

#### SSL/HTTPS Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Load Balancer Setup
For high availability, consider using AWS Application Load Balancer:
1. Create ALB in AWS Console
2. Configure target groups for frontend (port 80) and backend (port 8080)
3. Set up health checks
4. Configure SSL termination at ALB

#### Monitoring and Logging
```bash
# View application logs
docker-compose -f docker-compose.aws.yml logs -f

# Monitor system resources
htop
df -h
free -h

# Set up log rotation
sudo logrotate -f /etc/logrotate.conf
```

### Troubleshooting

#### Common Issues
```bash
# Check if Docker is running
sudo systemctl status docker

# Check container logs
docker-compose -f docker-compose.aws.yml logs backend

# Check network connectivity
curl -I http://localhost:8080/health

# Restart services
docker-compose -f docker-compose.aws.yml restart

# Clean up and redeploy
docker-compose -f docker-compose.aws.yml down -v
docker system prune -f
./deploy.sh
```

#### Performance Optimization
```bash
# Monitor resource usage
docker stats

# Optimize Docker daemon
sudo nano /etc/docker/daemon.json
# Add:
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# Restart Docker
sudo systemctl restart docker
```

### Backup and Recovery

#### Database Backup
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.aws.yml exec -T db mysqldump -u root -p waxshop > backup_$DATE.sql
gzip backup_$DATE.sql
aws s3 cp backup_$DATE.sql.gz s3://your-backup-bucket/
EOF

chmod +x backup.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup.sh
```

#### Application Backup
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Backup configuration files
tar -czf config_backup_$(date +%Y%m%d).tar.gz docker-compose.aws.yml deploy.sh
```

### Security Best Practices

#### Firewall Configuration
```bash
# Configure UFW firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 8080/tcp
sudo ufw enable
```

#### Regular Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose -f docker-compose.aws.yml pull
docker-compose -f docker-compose.aws.yml up -d
```

#### SSL Certificate Renewal
```bash
# Test certificate renewal
sudo certbot renew --dry-run

# Manual renewal
sudo certbot renew
```

This deployment guide provides comprehensive instructions for both local development and production deployment on AWS EC2. Follow the security best practices and monitor your deployment regularly for optimal performance and reliability. 