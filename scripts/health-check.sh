#!/bin/sh
# Health check script for Docker containers
# Usage: ./health-check.sh [service]

set -e

SERVICE=${1:-all}

check_api() {
  echo "Checking API health..."
  if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✓ API is healthy"
    return 0
  else
    echo "✗ API is not responding"
    return 1
  fi
}

check_web() {
  echo "Checking Web health..."
  if curl -f -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✓ Web is healthy"
    return 0
  else
    echo "✗ Web is not responding"
    return 1
  fi
}

check_oracle() {
  echo "Checking Oracle health..."
  if docker-compose exec -T oracle sqlplus -L sys/admin@//localhost:1521/orcl as sysdba <<EOF > /dev/null 2>&1
SELECT 1 FROM DUAL;
EXIT;
EOF
  then
    echo "✓ Oracle is healthy"
    return 0
  else
    echo "✗ Oracle is not responding"
    return 1
  fi
}

check_redis() {
  echo "Checking Redis health..."
  if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✓ Redis is healthy"
    return 0
  else
    echo "✗ Redis is not responding"
    return 1
  fi
}

case $SERVICE in
  api)
    check_api
    ;;
  web)
    check_web
    ;;
  oracle)
    check_oracle
    ;;
  redis)
    check_redis
    ;;
  all)
    echo "==================================="
    echo "  NCBS Docker Health Check"
    echo "==================================="
    echo ""
    
    EXIT_CODE=0
    
    check_oracle || EXIT_CODE=1
    echo ""
    
    check_redis || EXIT_CODE=1
    echo ""
    
    check_api || EXIT_CODE=1
    echo ""
    
    check_web || EXIT_CODE=1
    echo ""
    
    if [ $EXIT_CODE -eq 0 ]; then
      echo "==================================="
      echo "  All services are healthy! ✓"
      echo "==================================="
    else
      echo "==================================="
      echo "  Some services are unhealthy! ✗"
      echo "==================================="
    fi
    
    exit $EXIT_CODE
    ;;
  *)
    echo "Unknown service: $SERVICE"
    echo "Usage: $0 [api|web|oracle|redis|all]"
    exit 1
    ;;
esac

