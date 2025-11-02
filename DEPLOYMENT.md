# Deployment Guide

This document explains how to set up and use the GitLab CI/CD pipeline for deploying the Logistic Panel application.

## Pipeline Overview

The CI/CD pipeline consists of 4 stages:

1. **Prepare** - Install PHP and Node.js dependencies
2. **Test** - Run linting and tests (PHPUnit, frontend build)
3. **Build** - Build and push Docker image to GitLab Container Registry
4. **Deploy** - Deploy to staging/production servers (manual trigger)

## Required GitLab CI/CD Variables

Configure these variables in GitLab: **Settings → CI/CD → Variables**

### Container Registry Variables (Auto-configured by GitLab)
- `CI_REGISTRY` - GitLab Container Registry URL (auto)
- `CI_REGISTRY_USER` - Registry username (auto)
- `CI_REGISTRY_PASSWORD` - Registry password (auto)
- `CI_REGISTRY_IMAGE` - Your image name (auto)

### Deployment Variables (You need to configure)

#### SSH Access
- `SSH_PRIVATE_KEY` - SSH private key for accessing deployment servers
  - Type: File
  - Protected: Yes
  - Generate: `ssh-keygen -t ed25519 -C "gitlab-ci@yourdomain.com"`
  - Add public key to server: `~/.ssh/authorized_keys`

#### Staging Server
- `STAGING_SERVER` - Staging server IP/hostname (e.g., `staging.example.com`)
- `STAGING_USER` - SSH user for staging server (e.g., `deploy`)

#### Production Server
- `PRODUCTION_SERVER` - Production server IP/hostname (e.g., `example.com`)
- `PRODUCTION_USER` - SSH user for production server (e.g., `deploy`)

## Server Setup

### 1. Install Docker on Server

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Enable Docker service
sudo systemctl enable docker
sudo systemctl start docker
```

### 2. Create Environment File

Create `.env.staging` or `.env.production` on the server:

```bash
# On staging server
nano /home/deploy/.env.staging

# On production server
nano /home/deploy/.env.production
```

Add your environment variables:

```env
APP_NAME="Logistics Panel"
APP_ENV=production
APP_KEY=base64:your-generated-key-here
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=logistics_panel
DB_USERNAME=db_user
DB_PASSWORD=secure_password

# Add all other required variables from .env.example
```

### 3. Configure GitLab Container Registry Access

```bash
# Login to GitLab Container Registry
docker login registry.gitlab.com -u <your-username> -p <your-access-token>

# Or use deploy token:
# Settings → Repository → Deploy Tokens
docker login registry.gitlab.com -u <deploy-token-username> -p <deploy-token>
```

### 4. Setup Database

Ensure your database is created and accessible:

```sql
CREATE DATABASE logistics_panel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'db_user'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON logistics_panel.* TO 'db_user'@'%';
FLUSH PRIVILEGES;
```

## Workflow

### Automatic Triggers

1. **Push to `develop` branch**:
   - Runs tests
   - Builds Docker image with tag `staging`
   - Waits for manual deployment to staging

2. **Push to `main` branch**:
   - Runs tests
   - Builds Docker image with tag `production`
   - Waits for manual deployment to production

3. **Push a tag** (e.g., `v1.0.0`):
   - Runs tests
   - Builds Docker image with tag from version

### Manual Deployment

1. Go to **CI/CD → Pipelines** in GitLab
2. Click on the pipeline for your commit
3. Navigate to the **deploy** stage
4. Click **Play** button on `deploy:staging` or `deploy:production`

## Local Testing

### Build Docker Image Locally

```bash
docker build -t logistic-panel:local .
```

### Run Container Locally

```bash
docker run -d \
  --name logistic-panel-local \
  -p 8000:80 \
  -e APP_KEY=base64:your-key \
  -e DB_HOST=host.docker.internal \
  -e DB_DATABASE=logistics_panel \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=password \
  logistic-panel:local
```

### Run Migrations

```bash
docker exec logistic-panel-local php artisan migrate --force
```

### View Logs

```bash
docker logs -f logistic-panel-local
```

## Troubleshooting

### Pipeline Fails at Build Stage

**Issue**: Docker build fails
**Solution**:
- Check Dockerfile syntax
- Ensure all required files exist
- Review build logs for specific errors

### Pipeline Fails at Test Stage

**Issue**: Tests fail
**Solution**:
- Run tests locally: `php artisan test`
- Check database connection in CI
- Review test output in artifacts

### Deployment Fails

**Issue**: SSH connection fails
**Solution**:
- Verify SSH_PRIVATE_KEY is correctly set
- Check server is accessible: `ssh user@server`
- Verify SSH key is added to server's authorized_keys

**Issue**: Docker pull fails on server
**Solution**:
- Ensure server is logged into GitLab Container Registry
- Check registry permissions
- Verify image was pushed successfully

### Application Doesn't Start

**Issue**: Container exits immediately
**Solution**:
- Check logs: `docker logs logistic-panel-prod`
- Verify .env file has all required variables
- Check database connectivity from container

## Monitoring

### Check Container Status

```bash
# On server
docker ps -a

# View container logs
docker logs -f logistic-panel-prod

# Check container health
docker inspect logistic-panel-prod | grep -A 10 Health
```

### Access Container Shell

```bash
docker exec -it logistic-panel-prod bash

# Inside container
php artisan --version
php artisan config:show
```

## Rollback

If deployment fails, rollback to previous version:

```bash
# Stop current container
docker stop logistic-panel-prod
docker rm logistic-panel-prod

# Run previous version (replace TAG with previous tag)
docker run -d \
  --name logistic-panel-prod \
  --restart unless-stopped \
  -p 80:80 \
  --env-file /home/deploy/.env.production \
  registry.gitlab.com/your-group/logistic-panel:TAG
```

## Security Best Practices

1. **Never commit** `.env` files to repository
2. **Use protected variables** for sensitive data in GitLab
3. **Enable branch protection** for main/develop branches
4. **Use deploy tokens** instead of personal access tokens for registry
5. **Regularly rotate** SSH keys and tokens
6. **Enable 2FA** on GitLab account
7. **Review** access logs regularly

## Additional Resources

- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Docker Documentation](https://docs.docker.com/)
- [Laravel Deployment Guide](https://laravel.com/docs/deployment)
