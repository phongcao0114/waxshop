#!/bin/bash

# =============================
# EC2 Deployment Wrapper Script
# =============================
#
# This script copies necessary deployment files to the EC2 instance and runs deploy.sh remotely.
# Usage: ./deploy-ec2.sh <path-to-keypair.pem>
#

set -e

# Check for keypair argument
if [ -z "$1" ]; then
  echo "Usage: $0 <path-to-keypair.pem>"
  exit 1
fi

KEY_PAIR="$1"
EC2_USER="ec2-user"
EC2_HOST="ec2-3-104-179-158.ap-southeast-2.compute.amazonaws.com"
REMOTE_PATH="~"

# Ensure correct permissions on the key file
echo "🔑 Setting permissions on key file..."
sudo chmod 400 "$KEY_PAIR"

# 1. Copy files to EC2
echo "📦 Copying deployment files to EC2..."
sudo scp -i "$KEY_PAIR" -r \
    docker-compose.aws.yml \
    deploy.sh \
    backend/db-init \
    "$EC2_USER@$EC2_HOST:$REMOTE_PATH"

# 2. SSH into EC2 and run deploy.sh
echo "🚀 Running deployment script on EC2..."
sudo ssh -i "$KEY_PAIR" "$EC2_USER@$EC2_HOST" "cd $REMOTE_PATH && chmod +x deploy.sh && ./deploy.sh"

echo "✅ Deployment process triggered on EC2!" 