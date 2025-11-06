#!/bin/bash
set -e

# Create necessary directories if they don't exist
mkdir -p /app/storage/framework/cache/data
mkdir -p /app/storage/framework/sessions
mkdir -p /app/storage/framework/views
mkdir -p /app/storage/logs
mkdir -p /app/bootstrap/cache

# Set proper permissions
chmod -R 775 /app/storage
chmod -R 775 /app/bootstrap/cache

# Wait for database to be ready (if needed)
if [ -n "$DB_HOST" ]; then
    echo "Waiting for database..."
    for i in {1..30}; do
        if php artisan db:show >/dev/null 2>&1; then
            echo "Database is ready!"
            break
        fi
        echo "Database not ready, waiting... ($i/30)"
        sleep 2
    done
fi

# Run Laravel optimizations
echo "Running Laravel optimizations..."
php artisan config:cache 2>/dev/null || true
php artisan route:cache 2>/dev/null || true
php artisan view:cache 2>/dev/null || true

# Run migrations (optional - uncomment if needed)
# php artisan migrate --force

# Clear and cache optimizations
php artisan optimize

# Determine which service to run based on CONTAINER_ROLE
role=${CONTAINER_ROLE:-app}

case "$role" in
    app)
        echo "Starting Application server..."
        exec "$@"
        ;;
    queue)
        echo "Starting Queue worker..."
        exec php artisan queue:work --sleep=3 --tries=3 --max-time=3600
        ;;
    scheduler)
        echo "Starting Scheduler..."
        while true; do
            php artisan schedule:run --verbose --no-interaction &
            sleep 60
        done
        ;;
    supervisor)
        echo "Starting Supervisor (app + queue)..."
        exec /usr/bin/supervisord -c /etc/supervisor.d/supervisord.ini
        ;;
    *)
        echo "Unknown CONTAINER_ROLE: $role"
        exit 1
        ;;
esac
