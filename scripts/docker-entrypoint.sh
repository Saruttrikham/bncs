#!/bin/sh
set -e

# Wait for Oracle to be ready
wait_for_oracle() {
  echo "Waiting for Oracle database to be ready..."
  max_attempts=30
  attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if echo "SELECT 1 FROM DUAL;" | sqlplus -S system/$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_DATABASE > /dev/null 2>&1; then
      echo "Oracle is ready!"
      return 0
    fi
    
    attempt=$((attempt + 1))
    echo "Attempt $attempt/$max_attempts: Oracle not ready yet..."
    sleep 5
  done
  
  echo "Failed to connect to Oracle after $max_attempts attempts"
  return 1
}

# Wait for Redis to be ready
wait_for_redis() {
  echo "Waiting for Redis to be ready..."
  max_attempts=30
  attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if redis-cli -h $REDIS_HOST -p $REDIS_PORT ping > /dev/null 2>&1; then
      echo "Redis is ready!"
      return 0
    fi
    
    attempt=$((attempt + 1))
    echo "Attempt $attempt/$max_attempts: Redis not ready yet..."
    sleep 2
  done
  
  echo "Failed to connect to Redis after $max_attempts attempts"
  return 1
}

# Run database migrations if needed
run_migrations() {
  if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running database migrations..."
    cd /app && bun run db:migrate
  fi
}

# Main execution
main() {
  # Wait for dependencies
  if [ -n "$DB_HOST" ]; then
    wait_for_oracle
  fi
  
  if [ -n "$REDIS_HOST" ]; then
    wait_for_redis
  fi
  
  # Run migrations
  run_migrations
  
  # Execute the main command
  echo "Starting application..."
  exec "$@"
}

main "$@"

