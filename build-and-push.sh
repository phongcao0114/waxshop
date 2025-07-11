#!/bin/bash

# =============================
# Build and Push Script
# =============================
#
# This script builds the Docker images and pushes them to Docker Hub
# Run this when you want to deploy code changes to production
#

set -e  # Exit on any error

echo "🚀 Starting build and push process..."

# Ensure uploads folder exists and has content
if [ ! -d "backend/uploads" ] || [ -z "$(ls -A backend/uploads 2>/dev/null)" ]; then
    echo "❌ Error: backend/uploads folder is empty or missing!"
    echo "   Please ensure you have product images in backend/uploads/"
    exit 1
fi

echo "✅ Found uploads folder with images"

# Build images
echo "📦 Building Docker images..."
docker-compose -f docker-compose.build.yml build

# Tag images with timestamp for versioning
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
echo "🏷️  Tagging images with timestamp: $TIMESTAMP"

# Tag backend
docker tag jackwind9000/ecommerce-backend:latest jackwind9000/ecommerce-backend:$TIMESTAMP
echo "✅ Backend tagged as: jackwind9000/ecommerce-backend:$TIMESTAMP"

# Tag frontend
docker tag jackwind9000/ecommerce-frontend:latest jackwind9000/ecommerce-frontend:$TIMESTAMP
echo "✅ Frontend tagged as: jackwind9000/ecommerce-frontend:$TIMESTAMP"

# Push images to Docker Hub
echo "📤 Pushing images to Docker Hub..."

# Push backend
echo "📤 Pushing backend image..."
docker push jackwind9000/ecommerce-backend:latest
docker push jackwind9000/ecommerce-backend:$TIMESTAMP

# Push frontend
echo "📤 Pushing frontend image..."
docker push jackwind9000/ecommerce-frontend:latest
docker push jackwind9000/ecommerce-frontend:$TIMESTAMP

echo "✅ All images pushed successfully!"
echo "📋 Summary:"
echo "   Backend: jackwind9000/ecommerce-backend:latest (and :$TIMESTAMP)"
echo "   Frontend: jackwind9000/ecommerce-frontend:latest (and :$TIMESTAMP)"
echo ""
echo "🎯 Next steps:"
echo "   1. Deploy to production: docker-compose -f docker-compose.deploy.yml up -d"
echo "   2. Or update existing deployment: docker-compose -f docker-compose.deploy.yml pull && docker-compose -f docker-compose.deploy.yml up -d" 