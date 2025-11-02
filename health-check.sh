#!/bin/bash

# Courtly Project Health Check Script
# This script verifies that all components of the Courtly system are working properly

set -e

echo "======================================"
echo "  Courtly Project Health Check"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a service is running
check_service() {
    local service_name=$1
    local port=$2
    
    echo -n "Checking $service_name... "
    
    if curl -f -s "http://localhost:$port" > /dev/null 2>&1 || \
       curl -f -s "http://localhost:$port/api/" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ RUNNING${NC}"
        return 0
    else
        echo -e "${RED}✗ NOT ACCESSIBLE${NC}"
        return 1
    fi
}

# Function to check Docker container status
check_container() {
    local container_name=$1
    
    if docker ps --format '{{.Names}}' | grep -q "$container_name"; then
        echo -e "${GREEN}✓${NC} $container_name is running"
        return 0
    else
        echo -e "${RED}✗${NC} $container_name is not running"
        return 1
    fi
}

echo "1. Checking Docker containers:"
echo "------------------------------"
check_container "courtly-project-db-1"
check_container "courtly-project-backend-1"
check_container "courtly-project-frontend-1"
check_container "courtly-project-pgadmin-1"
echo ""

echo "2. Checking service accessibility:"
echo "-----------------------------------"
check_service "Backend API" "8001"
check_service "Frontend" "3001"
check_service "pgAdmin" "5050"
echo ""

echo "3. Checking database connection:"
echo "---------------------------------"
echo -n "Testing PostgreSQL connection... "
if docker exec courtly-project-db-1 pg_isready -U courtly_user -d courtly > /dev/null 2>&1; then
    echo -e "${GREEN}✓ DATABASE READY${NC}"
else
    echo -e "${RED}✗ DATABASE NOT READY${NC}"
fi
echo ""

echo "4. Checking API endpoints:"
echo "---------------------------"
echo -n "Testing /api/ endpoint... "
if curl -f -s http://localhost:8001/api/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ RESPONDING${NC}"
    echo "Available endpoints:"
    curl -s http://localhost:8001/api/ | python3 -m json.tool 2>/dev/null || echo "  (Could not parse JSON)"
else
    echo -e "${RED}✗ NOT RESPONDING${NC}"
fi
echo ""

echo "5. System Summary:"
echo "-------------------"
echo "Backend (Django):  http://localhost:8001"
echo "Frontend (Next.js): http://localhost:3001"
echo "pgAdmin:           http://localhost:5050"
echo "Database:          localhost:5432"
echo ""

echo "======================================"
echo "  Health Check Complete"
echo "======================================"
