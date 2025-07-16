#!/bin/bash

# =============================
# Build and Push Script (Separate Backend/Frontend)
# =============================
#
# This script builds and pushes Docker images separately
# Usage: ./build-and-push.sh [backend|frontend|both]
#

set -e  # Exit on any error

# Default to both if no argument provided
BUILD_TARGET=${1:-both}

echo "🚀 Starting build and push process for: $BUILD_TARGET"

# Function to build and push backend
build_backend() {
    echo "📦 Building backend Docker image..."
    
    # Ensure uploads folder exists and has content
    if [ ! -d "backend/uploads" ] || [ -z "$(ls -A backend/uploads 2>/dev/null)" ]; then
        echo "❌ Error: backend/uploads folder is empty or missing!"
        echo "   Please ensure you have product images in backend/uploads/"
        exit 1
    fi
    
    echo "✅ Found uploads folder with images"
    
    # Build backend
    docker build -t jackwind9000/ecommerce-backend:latest ./backend
    
    # Tag with timestamp
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    docker tag jackwind9000/ecommerce-backend:latest jackwind9000/ecommerce-backend:$TIMESTAMP
    echo "✅ Backend tagged as: jackwind9000/ecommerce-backend:$TIMESTAMP"
    
    # Push backend
    echo "📤 Pushing backend image..."
    docker push jackwind9000/ecommerce-backend:latest
    docker push jackwind9000/ecommerce-backend:$TIMESTAMP
    
    echo "✅ Backend image pushed successfully!"
}

# Function to build and push frontend
build_frontend() {
    echo "📦 Building frontend Docker image..."
    
    # Build frontend
    docker build -t jackwind9000/ecommerce-frontend:latest ./frontend
    
    # Tag with timestamp
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    docker tag jackwind9000/ecommerce-frontend:latest jackwind9000/ecommerce-frontend:$TIMESTAMP
    echo "✅ Frontend tagged as: jackwind9000/ecommerce-frontend:$TIMESTAMP"
    
    # Push frontend
    echo "📤 Pushing frontend image..."
    docker push jackwind9000/ecommerce-frontend:latest
    docker push jackwind9000/ecommerce-frontend:$TIMESTAMP
    
    echo "✅ Frontend image pushed successfully!"
}

# Main execution logic
case $BUILD_TARGET in
    "backend")
        echo "🎯 Building and pushing BACKEND only..."
        build_backend
        ;;
    "frontend")
        echo "🎯 Building and pushing FRONTEND only..."
        build_frontend
        ;;
    "both")
        echo "🎯 Building and pushing BOTH backend and frontend..."
        build_backend
        build_frontend
        ;;
    *)
        echo "❌ Invalid argument: $BUILD_TARGET"
        echo "Usage: $0 [backend|frontend|both]"
        echo "  backend  - Build and push only backend"
        echo "  frontend - Build and push only frontend"
        echo "  both     - Build and push both (default)"
        exit 1
        ;;
esac

echo "✅ Build and push process completed for: $BUILD_TARGET"
echo "📋 Summary:"
echo "   Target: $BUILD_TARGET"
echo ""
echo "🎯 Next steps:"
echo "   1. Deploy to production: docker-compose -f docker-compose.deploy.yml up -d"
echo "   2. Or update existing deployment: docker-compose -f docker-compose.deploy.yml pull && docker-compose -f docker-compose.deploy.yml up -d" 