# AWS EC2 Deployment Guide

Professional deployment guide for the EcommerceApp on AWS EC2 instance.

## EC2 Instance Info

- **Public IP:** `52.64.186.20`
- **Public DNS:** `ec2-52-64-186-20.ap-southeast-2.compute.amazonaws.com`
- **Console Link:** [AWS EC2 Console](https://ap-southeast-2.console.aws.amazon.com/ec2/home?region=ap-southeast-2#Home:)

## SSH Access

### Set Key Permissions
```bash
sudo chmod 400 <your-keypair>.pem
```

### Connect to EC2
```bash
sudo ssh -i "<your-keypair>.pem" ec2-user@ec2-52-64-186-20.ap-southeast-2.compute.amazonaws.com
```

## Build and Deploy

### From Local Machine

#### 1. Build Application
```bash
./build-and-push.sh
```

#### 2. Copy Files to EC2
```bash
# Copy deployment script
sudo scp -i "<your-keypair>.pem" deploy.sh ec2-user@52.64.186.20:~/

# Copy Docker Compose configuration
sudo scp -i "<your-keypair>.pem" docker-compose.aws.yml ec2-user@52.64.186.20:~/

# Copy database initialization files
sudo scp -i "<your-keypair>.pem" backend/db-init/create-db.sql ec2-user@52.64.186.20:~/db-init/
sudo scp -i "<your-keypair>.pem" backend/db-init/init-db.sql ec2-user@52.64.186.20:~/db-init/

# Copy uploaded product images
sudo scp -i "<your-keypair>.pem" backend/uploads/* ec2-user@52.64.186.20:~/temp-uploads/
```

### From Inside EC2

#### 3. Verify Uploaded Files
```bash
ls -l ~
```

**Expected files:**
- `deploy.sh`
- `docker-compose.aws.yml`
- `db-init/` (with SQL files)

#### 4. Run Deployment
```bash
./deploy.sh
```

##  Test

- **Frontend:** Open in browser: http://ec2-52-64-186-20.ap-southeast-2.compute.amazonaws.com
- **Backend (test via curl):** curl -X POST http://ec2-52-64-186-20.ap-southeast-2.compute.amazonaws.com:8080/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@admin.com","password":"admin123"}'

## 🔧 Quick Troubleshooting

### Common Issues
```bash
# Permission denied error
chmod +x deploy.sh

# Docker not running
sudo systemctl start docker

# Check running containers
docker ps

# View application logs
docker-compose -f docker-compose.aws.yml logs -f
```

### Useful Commands
```bash
# Restart services
docker-compose -f docker-compose.aws.yml restart

# Stop all services
docker-compose -f docker-compose.aws.yml down

# Check system resources
df -h
```

## 📝 Default Credentials

- **Admin Account:** `admin@admin.com` / `admin123`
- **Database:** `sa` / (see docker-compose.aws.yml)

## 🔒 Security Notes

Ensure these ports are open in your EC2 security group:
- **Port 80:** HTTP (Frontend)
- **Port 8080:** HTTP (Backend API)
- **Port 22:** SSH (Management)

---

**Note:** Replace `<your-keypair>` with your actual keypair filename throughout this guide.