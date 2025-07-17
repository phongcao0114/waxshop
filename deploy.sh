#!/bin/bash

# =============================
# AWS EC2 Deployment Script
# =============================
#
# This script deploys the application using prebuilt images from Docker Hub
# Run this on your AWS EC2 instance
#

set -e  # Exit on any error

echo "🚀 Starting AWS deployment process..."

# Set environment variables
export PUBLIC_IP="3.104.179.158"
export PUBLIC_DNS="ec2-3-104-179-158.ap-southeast-2.compute.amazonaws.com"
export BACKEND_URL="http://${PUBLIC_IP}:8080"

# Check if docker-compose.aws.yml exists, if not create it
if [ ! -f "docker-compose.aws.yml" ]; then
    echo "📝 Creating docker-compose.aws.yml configuration..."
    cat > docker-compose.aws.yml << EOF
version: '3.8'

services:
  frontend:
    image: jackwind9000/ecommerce-frontend:latest
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - BACKEND_URL=${BACKEND_URL}
      - PUBLIC_IP=${PUBLIC_IP}
      - PUBLIC_DNS=${PUBLIC_DNS}
    restart: unless-stopped

  backend:
    image: jackwind9000/ecommerce-backend:latest
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/ecommerce_app?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=YourStrong!Passw0rd
      - SPRING_JPA_HIBERNATE_DDL_AUTO=update
      - SPRING_PROFILES_ACTIVE=prod
      - JWT_SECRET=secret123
      - JWT_EXPIRATION=900000
      - PUBLIC_IP=${PUBLIC_IP}
      - PUBLIC_DNS=${PUBLIC_DNS}
    volumes:
      - uploads-data:/app/uploads
    restart: unless-stopped
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=YourStrong!Passw0rd
      - MYSQL_DATABASE=ecommerce_app
      - MYSQL_USER=ecommerce_user
      - MYSQL_PASSWORD=ecommerce_pass
    volumes:
      - db_data:/var/lib/mysql
      - ./db-init/create-db.sql:/docker-entrypoint-initdb.d/01-create-db.sql:ro
      - ./db-init/init-db.sql:/docker-entrypoint-initdb.d/02-init-db.sql:ro
    ports:
      - "3306:3306"
    restart: unless-stopped
    command: --default-authentication-plugin=mysql_native_password

volumes:
  db_data:
  uploads-data:
EOF
    echo "✅ Created docker-compose.aws.yml with configurable environment variables"
fi

# Pull latest images from Docker Hub
echo "📥 Pulling latest images from Docker Hub..."
docker-compose -f docker-compose.aws.yml pull

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.aws.yml down

# Start containers with new images
echo "▶️  Starting containers with latest images..."
docker-compose -f docker-compose.aws.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Health check
echo "🔍 Performing health checks..."
echo "Checking backend health..."
if curl -f http://localhost:8080/health; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    echo "📋 Backend logs:"
    docker-compose -f docker-compose.aws.yml logs backend
    exit 1
fi

echo "Checking frontend health..."
if curl -f http://localhost; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    echo "📋 Frontend logs:"
    docker-compose -f docker-compose.aws.yml logs frontend
    exit 1
fi

# Check service status
echo "🔍 Checking service status..."
docker-compose -f docker-compose.aws.yml ps

echo "✅ AWS deployment completed successfully!"
echo "🌐 Your application is now available at:"
echo "   Frontend: http://${PUBLIC_IP}"
echo "   Frontend (DNS): http://${PUBLIC_DNS}"
echo "   Backend API: http://${PUBLIC_IP}:8080"
echo "   Backend API (DNS): http://${PUBLIC_DNS}:8080"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose -f docker-compose.aws.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.aws.yml down"
echo "   Restart services: docker-compose -f docker-compose.aws.yml restart"
echo "   Monitor resources: docker stats"
echo ""
echo "📋 Troubleshooting:"
echo "   Check container logs: docker-compose -f docker-compose.aws.yml logs [service-name]"
echo "   Access container shell: docker-compose -f docker-compose.aws.yml exec [service-name] bash"
echo "   Check resource usage: docker stats --no-stream" 