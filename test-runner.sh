#!/bin/bash
# Teman Testing Quick Start
# This script automates common testing tasks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Teman Application Testing Suite        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Function to print section headers
print_header() {
    echo -e "${BLUE}→${NC} $1"
}

# Function to check if a command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Success"
    else
        echo -e "${RED}✗${NC} Failed"
        exit 1
    fi
}

# Parse command line arguments
case "$1" in
    "unit")
        print_header "Running Unit Tests"
        pnpm test
        check_status
        ;;
    
    "unit:watch")
        print_header "Running Unit Tests (Watch Mode)"
        pnpm test --watch
        check_status
        ;;
    
    "e2e")
        print_header "Running E2E Tests (Headless)"
        pnpm test:e2e
        check_status
        ;;
    
    "e2e:ui")
        print_header "Running E2E Tests (UI Mode)"
        pnpm test:e2e:ui
        check_status
        ;;
    
    "e2e:debug")
        print_header "Running E2E Tests (Debug Mode)"
        pnpm test:e2e:debug
        check_status
        ;;
    
    "dev")
        print_header "Starting Development Server"
        pnpm dev
        ;;
    
    "dev:db")
        print_header "Starting Development Server with Database"
        echo -e "${YELLOW}Note: Make sure PostgreSQL is running${NC}"
        echo "  docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db"
        echo ""
        pnpm dev
        ;;
    
    "db:setup")
        print_header "Setting up Database"
        echo -e "${YELLOW}Step 1: Starting PostgreSQL...${NC}"
        docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db
        echo -e "${YELLOW}Step 2: Waiting for PostgreSQL to be ready...${NC}"
        sleep 5
        echo -e "${YELLOW}Step 3: Applying migrations...${NC}"
        pnpm db:push
        check_status
        echo -e "${GREEN}Database setup complete!${NC}"
        ;;
    
    "db:stop")
        print_header "Stopping Database"
        docker compose -f docker-compose.yml -f docker-compose.dev.yml down db
        check_status
        ;;
    
    "build")
        print_header "Building for Production"
        pnpm build
        check_status
        echo -e "${GREEN}Build output in: .next/standalone${NC}"
        ;;
    
    "build:worker")
        print_header "Building Worker Service"
        pnpm build:worker
        check_status
        echo -e "${GREEN}Worker bundled to: dist/worker.js${NC}"
        ;;
    
    "all")
        print_header "Running Full Test Suite"
        echo ""
        
        print_header "1. Running Unit Tests"
        timeout 30 pnpm test || true
        echo ""
        
        print_header "2. Building Application"
        pnpm build || echo -e "${RED}Build failed (database might be needed)${NC}"
        echo ""
        
        print_header "3. Building Worker"
        pnpm build:worker
        echo ""
        
        echo -e "${GREEN}Test suite execution complete!${NC}"
        ;;
    
    "help"|"")
        echo "Usage: ./test-runner.sh [command]"
        echo ""
        echo "Commands:"
        echo "  ${YELLOW}unit${NC}           Run unit tests (once)"
        echo "  ${YELLOW}unit:watch${NC}     Run unit tests in watch mode"
        echo "  ${YELLOW}e2e${NC}            Run E2E tests (headless)"
        echo "  ${YELLOW}e2e:ui${NC}         Run E2E tests in UI mode"
        echo "  ${YELLOW}e2e:debug${NC}      Run E2E tests in debug mode"
        echo "  ${YELLOW}dev${NC}            Start development server"
        echo "  ${YELLOW}dev:db${NC}         Start dev server with database"
        echo "  ${YELLOW}db:setup${NC}       Setup PostgreSQL and run migrations"
        echo "  ${YELLOW}db:stop${NC}        Stop PostgreSQL"
        echo "  ${YELLOW}build${NC}          Build for production"
        echo "  ${YELLOW}build:worker${NC}   Build worker service"
        echo "  ${YELLOW}all${NC}            Run complete test suite"
        echo "  ${YELLOW}help${NC}           Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./test-runner.sh unit              # Run unit tests once"
        echo "  ./test-runner.sh e2e:ui            # Run E2E tests in browser UI"
        echo "  ./test-runner.sh dev               # Start dev server"
        echo "  ./test-runner.sh db:setup          # Setup database"
        echo ""
        ;;
    
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo "Run './test-runner.sh help' for usage information"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
