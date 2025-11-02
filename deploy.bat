@echo off
REM Simple deployment script for Windows
REM This script can be used for local testing or manual deployment

setlocal EnableDelayedExpansion

REM Configuration
set IMAGE_NAME=logistic-panel
set CONTAINER_NAME=logistic-panel
set PORT=8000

echo ========================================
echo Logistic Panel Deployment Script
echo ========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo Warning: .env file not found
    echo Copying .env.example to .env
    copy .env.example .env
    echo Please configure .env file before running the application
    echo.
)

REM Build Docker image
echo Step 1: Building Docker image...
docker build -t %IMAGE_NAME%:latest .

if errorlevel 1 (
    echo Failed to build Docker image
    exit /b 1
)
echo Docker image built successfully
echo.

REM Stop and remove existing container
echo Step 2: Stopping existing container (if any)...
docker stop %CONTAINER_NAME% 2>nul
docker rm %CONTAINER_NAME% 2>nul
echo Cleaned up existing container
echo.

REM Run new container
echo Step 3: Starting new container...
docker run -d ^
    --name %CONTAINER_NAME% ^
    --restart unless-stopped ^
    -p %PORT%:80 ^
    --env-file .env ^
    %IMAGE_NAME%:latest

if errorlevel 1 (
    echo Failed to start container
    exit /b 1
)
echo Container started successfully
echo.

REM Wait for container to be ready
echo Step 4: Waiting for application to be ready...
timeout /t 5 /nobreak >nul
echo.

REM Run migrations
echo Step 5: Running database migrations...
docker exec %CONTAINER_NAME% php artisan migrate --force

if errorlevel 1 (
    echo Warning: Migrations failed or not needed
) else (
    echo Migrations completed
)
echo.

REM Clear and cache config
echo Step 6: Optimizing application...
docker exec %CONTAINER_NAME% php artisan config:cache
docker exec %CONTAINER_NAME% php artisan route:cache
docker exec %CONTAINER_NAME% php artisan view:cache
echo.

REM Show container status
echo Step 7: Container status
docker ps | findstr %CONTAINER_NAME%
echo.

echo ========================================
echo Deployment completed successfully!
echo ========================================
echo.
echo Application URL: http://localhost:%PORT%
echo Container name: %CONTAINER_NAME%
echo.
echo Useful commands:
echo   View logs:         docker logs -f %CONTAINER_NAME%
echo   Access shell:      docker exec -it %CONTAINER_NAME% bash
echo   Stop container:    docker stop %CONTAINER_NAME%
echo   Restart container: docker restart %CONTAINER_NAME%
echo.

REM Ask to view logs
set /p REPLY="Do you want to view the logs? (y/n) "
if /i "%REPLY%"=="y" (
    docker logs -f %CONTAINER_NAME%
)

endlocal
