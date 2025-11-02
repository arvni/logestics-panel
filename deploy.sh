#!/bin/bash

# Simple deployment script for manual deployment
# This script can be used for local testing or manual deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="logistic-panel"
CONTAINER_NAME="logistic-panel"
PORT=8000

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Logistic Panel Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found${NC}"
    echo -e "${YELLOW}Copying .env.example to .env${NC}"
    cp .env.example .env
    echo -e "${RED}Please configure .env file before running the application${NC}"
fi

# Build Docker image
echo -e "\n${GREEN}Step 1: Building Docker image...${NC}"
docker build -t $IMAGE_NAME:latest .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
else
    echo -e "${RED}✗ Failed to build Docker image${NC}"
    exit 1
fi

# Stop and remove existing container
echo -e "\n${GREEN}Step 2: Stopping existing container (if any)...${NC}"
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true
echo -e "${GREEN}✓ Cleaned up existing container${NC}"

# Run new container
echo -e "\n${GREEN}Step 3: Starting new container...${NC}"
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p $PORT:80 \
    --env-file .env \
    $IMAGE_NAME:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Container started successfully${NC}"
else
    echo -e "${RED}✗ Failed to start container${NC}"
    exit 1
fi

# Wait for container to be ready
echo -e "\n${GREEN}Step 4: Waiting for application to be ready...${NC}"
sleep 5

# Run migrations
echo -e "\n${GREEN}Step 5: Running database migrations...${NC}"
docker exec $CONTAINER_NAME php artisan migrate --force

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations completed${NC}"
else
    echo -e "${YELLOW}⚠ Migrations failed or not needed${NC}"
fi

# Clear and cache config
echo -e "\n${GREEN}Step 6: Optimizing application...${NC}"
docker exec $CONTAINER_NAME php artisan config:cache
docker exec $CONTAINER_NAME php artisan route:cache
docker exec $CONTAINER_NAME php artisan view:cache

# Show container status
echo -e "\n${GREEN}Step 7: Container status${NC}"
docker ps | grep $CONTAINER_NAME

# Show logs
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}\n"
echo -e "Application URL: ${GREEN}http://localhost:$PORT${NC}"
echo -e "Container name: ${GREEN}$CONTAINER_NAME${NC}\n"
echo -e "Useful commands:"
echo -e "  View logs:        ${YELLOW}docker logs -f $CONTAINER_NAME${NC}"
echo -e "  Access shell:     ${YELLOW}docker exec -it $CONTAINER_NAME bash${NC}"
echo -e "  Stop container:   ${YELLOW}docker stop $CONTAINER_NAME${NC}"
echo -e "  Restart container: ${YELLOW}docker restart $CONTAINER_NAME${NC}\n"

# Ask to view logs
read -p "Do you want to view the logs? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker logs -f $CONTAINER_NAME
fi
